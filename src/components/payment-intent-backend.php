<?php

public function createStripePaymentIntent()
{
    //error_log("Registering route createStripePaymentIntent ");
    register_rest_route('wc/v3/stripe', 'payment_intent', array(
        'methods'             => "POST",
        'callback'            => function (WP_REST_Request $request) {

            $request_body = $request->get_json_params();
            $order_id     = wc_get_order_id_by_order_key($request_body['wc_order_key']);
            $payment_method = isset($request_body['payment_method']) ? $request_body['payment_method'] : 'card';

            error_log("Payment method received: " . $payment_method);

            // Google Pay usa 'card' come payment_method_type in Stripe
            $stripe_payment_method = ($payment_method === 'google_pay') ? 'card' : $payment_method;

            error_log("Stripe payment method type: " . $stripe_payment_method);

            $wcOrder = wc_get_order(absint($order_id));
            if (!$wcOrder || !$wcOrder->get_total()) {
                return new \WP_REST_Response(["error" => "Invalid order key."], 400);
            }
            if (get_current_user_id() != $wcOrder->get_customer_id()) {
                return new \WP_REST_Response(["error" => "Cannot process order of another user."], 400);
            }

            foreach ($wcOrder->get_items('line_item') as $item_id => $item) {
                $stock = $item->get_product()->get_stock_quantity();
                if ($stock < 1) {
                    return new \WP_REST_Response(["error" => "Opera già bloccata da un altro user. Quantità stock: " . $stock], 500);
                }
            }

            // Rimuovi eventuali fee esistenti per evitare duplicati
            foreach ($wcOrder->get_items('fee') as $fee_id => $fee) {
                if ($fee->get_name() === 'payment-gateway-fee') {
                    $wcOrder->remove_item($fee_id);
                }
            }

            // Aggiungi le commissioni in base al metodo di pagamento
            if ($payment_method == 'klarna') {
                $calculate_tax_for = array(
                    'country' => 'IT',
                    'state' => '',
                    'postcode' => '',
                    'city' => ''
                );

                $fee_taxable = $wcOrder->get_subtotal() * 1.22;
                error_log("Klarna fee calculation - fee_taxable: " . $fee_taxable);

                $item_fee = new WC_Order_Item_Fee();
                $item_fee->set_name("payment-gateway-fee");
                $item_fee->set_amount($fee_taxable * ($this->klarna_fee / 100));
                $item_fee->set_tax_class('');
                $item_fee->set_tax_status('taxable');
                $item_fee->set_total($fee_taxable * ($this->klarna_fee / 100));
                $item_fee->calculate_taxes($calculate_tax_for);
                $wcOrder->add_item($item_fee);

                error_log("Klarna fee added: " . ($fee_taxable * ($this->klarna_fee / 100)));
            }
            // Aggiungi qui altre logiche per altri metodi di pagamento se necessario
            // elseif ($payment_method == 'card') {
            //     // Logica per commissioni carte di credito se necessarie
            // }

            // Ricalcola i totali dell'ordine dopo aver aggiunto le fee
            $wcOrder->calculate_totals();

            global $wpdb;
            $stripeConf = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT option_value
                FROM {$wpdb->prefix}options
                where option_name='woocommerce_stripe_settings'
                ",
                    ARRAY_A
                ));
            $stripeConf       = unserialize($stripeConf);
            $currentSecretKey = $stripeConf['testmode'] == 'no' ? $stripeConf['secret_key'] : $stripeConf['test_secret_key'];
            $stripe           = new \Stripe\StripeClient($currentSecretKey);
            $wcCustomer       = new WC_Customer($wcOrder->get_customer_id());

            try {
                $stripeCustomer = $this->mergeStripeCustomer($stripe, $wcCustomer);
                $payment_intent = $stripe->paymentIntents->create([
                    'customer'                  => $stripeCustomer->id,
                    'amount'                    => $wcOrder->get_total() * 100,
                    'currency'                  => $wcOrder->get_currency(),
                    'automatic_payment_methods' => ['enabled' => false],
                    'payment_method_types'      => [$stripe_payment_method],
                    'description'               => 'Artpay - pagamento ordine #' . $order_id,
                    'receipt_email'             => $wcCustomer->get_email(),
                    'metadata'                  => ['order_id' => $wcOrder->get_id()],
                ]);
            } catch (Exception $e) {
                $payment_intent = $stripe->paymentIntents->create([
                    'amount'                    => $wcOrder->get_total() * 100,
                    'currency'                  => $wcOrder->get_currency(),
                    'automatic_payment_methods' => ['enabled' => false],
                    'payment_method_types'      => [$stripe_payment_method],
                    'description'               => 'Artpay - pagamento ordine #' . $order_id,
                    'receipt_email'             => $wcCustomer->get_email(),
                    'metadata'                  => ['order_id' => $wcOrder->get_id()],
                ]);
            }

            $wcOrder->update_meta_data('_stripe_intent_id', $payment_intent->id);
            $wcOrder->save();

            error_log("Payment intent created with method: " . $payment_method . " and amount: " . $wcOrder->get_total());

            return new \WP_REST_Response($payment_intent, 200);

        },
        'permission_callback' => '__return_true',
        'args'                => array(
            'id' => array(
                'validate_callback' => function ($param, $request, $key) {
                    return is_numeric($param);
                },
            ),
        ),
    ));
}

public function registerGooglePayDomain()
{
    register_rest_route('wc/v3/stripe', 'register-google-pay-domain', array(
        'methods'             => "POST",
        'callback'            => function (WP_REST_Request $request) {

            // Verifica permessi admin (TEMPORANEAMENTE DISABILITATO PER REGISTRAZIONE DOMINIO)
            // if (!current_user_can('manage_options')) {
            //     return new \WP_REST_Response(["error" => "Unauthorized"], 403);
            // }

            $request_body = $request->get_json_params();
            $domain_name = isset($request_body['domain_name']) ? $request_body['domain_name'] : '';

            if (empty($domain_name)) {
                return new \WP_REST_Response(["error" => "Domain name is required"], 400);
            }

            global $wpdb;
            $stripeConf = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT option_value FROM {$wpdb->prefix}options WHERE option_name=%s",
                    'woocommerce_stripe_settings'
                )
            );

            if (!$stripeConf) {
                error_log("Stripe configuration not found in database");
                return new \WP_REST_Response(["error" => "Stripe configuration not found"], 500);
            }

            $stripeConf = unserialize($stripeConf);
            $currentSecretKey = $stripeConf['testmode'] == 'no' ? $stripeConf['secret_key'] : $stripeConf['test_secret_key'];

            if (!$currentSecretKey) {
                error_log("Stripe secret key not found in configuration");
                return new \WP_REST_Response(["error" => "Stripe secret key not configured"], 500);
            }

            $stripe = new \Stripe\StripeClient($currentSecretKey);

            // Debug: verifica la versione di Stripe e se paymentMethodDomains esiste
            error_log("Stripe version: " . \Stripe\Stripe::VERSION);
            error_log("StripeClient created, checking paymentMethodDomains...");
            error_log("paymentMethodDomains property exists: " . (property_exists($stripe, 'paymentMethodDomains') ? 'yes' : 'no'));

            if (!isset($stripe->paymentMethodDomains)) {
                error_log("paymentMethodDomains is not set on StripeClient - possibly outdated Stripe library");
                return new \WP_REST_Response(["error" => "Stripe library version does not support Payment Method Domains. Please update stripe-php library."], 500);
            }

            try {
                $paymentMethodDomain = $stripe->paymentMethodDomains->create([
                    'domain_name' => $domain_name,
                ]);

                error_log("Google Pay domain registered: " . $domain_name);

                return new \WP_REST_Response([
                    'success' => true,
                    'domain' => $paymentMethodDomain
                ], 200);

            } catch (Exception $e) {
                error_log("Error registering Google Pay domain: " . $e->getMessage());
                return new \WP_REST_Response([
                    'error' => $e->getMessage()
                ], 500);
            }
        },
        'permission_callback' => '__return_true'
    ));
}

