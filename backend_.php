<?php
/**
 * Plugin Name: WooCommerce Custom Quote Status
 * Description: Aggiunge lo stato "Preventivo" a WooCommerce e lo abilita per le REST API.
 */

// 1️⃣ — Registra il nuovo stato "wc-quote"
add_action('init', function() {
  register_post_status('wc-quote', [
    'label'                     => _x('Preventivo', 'Order status', 'woocommerce'),
    'public'                    => true,
    'exclude_from_search'       => false,
    'show_in_admin_all_list'    => true,
    'show_in_admin_status_list' => true,
    'label_count'               => _n_noop('Preventivo <span class="count">(%s)</span>', 'Preventivi <span class="count">(%s)</span>'),
  ]);
});

// 2️⃣ — Aggiungi il nuovo stato all’elenco WooCommerce
add_filter('wc_order_statuses', function($order_statuses) {
  $order_statuses['wc-quote'] = _x('Preventivo', 'Order status', 'woocommerce');
  return $order_statuses;
});

// 3️⃣ — Rendi il nuovo status disponibile via REST API
add_filter('woocommerce_rest_order_schema', function($schema) {
  if (isset($schema['properties']['status']['enum'])) {
    $schema['properties']['status']['enum'][] = 'quote';
  }
  return $schema;
});

// 4️⃣ — (Opzionale) Imposta azione o label specifica in admin
add_action('admin_head', function() {
  echo '<style>
    .order-status.status-quote {
      background: #f5c542;
      color: #fff;
    }
  </style>';
});

// 5️⃣ — Funzione helper per inviare email preventivo
// NOTA: L'email NON viene più inviata automaticamente alla creazione dell'ordine,
// ma solo quando viene aggiunta/aggiornata la mail del cliente tramite l'endpoint dedicato
function wc_quote_send_email_notification($order) {
  if (!$order) {
    return false;
  }

  // ⚠️ IMPORTANTE: Invia email solo per l'ordine principale (parent_id = 0)
  // WooCommerce MultiVendor crea ordini figlio per ogni vendor, dobbiamo ignorarli
  if ($order->get_parent_id() != 0) {
    return false;
  }

  // Previeni invii duplicati controllando se l'email è già stata inviata
  $email_sent = $order->get_meta('_quote_email_sent', true);
  if ($email_sent) {
    return false;
  }

  $to = $order->get_billing_email();

  // Validazione email
  if (empty($to) || !is_email($to)) {
    return false;
  }

  $subject = 'Nuovo preventivo ricevuto - Ordine #' . $order->get_order_number();

  // Crea il link per la pagina di visualizzazione preventivo
  $link = site_url("/quotes?order_id={$order->get_id()}&key={$order->get_order_key()}&email=" . urlencode($order->get_billing_email()));

  // Template email HTML
  $message = wc_quote_get_email_template($order, $link);

  // Headers per email HTML
  $headers = array(
    'Content-Type: text/html; charset=UTF-8',
    'From: ' . get_bloginfo('name') . ' <' . get_option('admin_email') . '>'
  );

  // Invia l'email
  $email_result = wp_mail($to, $subject, $message, $headers);

  // Marca l'email come inviata per prevenire duplicati
  if ($email_result) {
    $order->update_meta_data('_quote_email_sent', current_time('mysql'));
    $order->save();

    // Log per debug
    $order->add_order_note('Email preventivo inviata a: ' . $to);
    return true;
  }

  return false;
}

function wc_quote_get_email_template($order, $link) {
  ob_start();
  ?>
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #f5c542; color: #fff; padding: 20px; text-align: center; }
      .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
      .button { display: inline-block; padding: 15px 30px; background: #0073aa; color: #fff; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
      .button.reject { background: #dc3232; }
      .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #f5c542; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Preventivo Ricevuto</h1>
      </div>
      <div class="content">
        <p>Ciao <strong><?php echo esc_html($order->get_billing_first_name()); ?></strong>,</p>

        <p>Hai ricevuto un nuovo preventivo per il tuo ordine #<?php echo $order->get_order_number(); ?>.</p>

        <div class="order-details">
          <h3>Dettagli Ordine</h3>
          <p><strong>Numero Ordine:</strong> #<?php echo $order->get_order_number(); ?></p>
          <p><strong>Totale:</strong> <?php echo $order->get_formatted_order_total(); ?></p>
          <p><strong>Data:</strong> <?php echo $order->get_date_created()->date('d/m/Y H:i'); ?></p>
        </div>

        <p>Clicca sul pulsante qui sotto per visualizzare il preventivo completo e decidere se accettare o rifiutare:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="<?php echo esc_url($link); ?>" class="button">Visualizza Preventivo</a>
        </div>

        <p style="font-size: 12px; color: #666;">
          <strong>Nota:</strong> Questo link è personale e sicuro. Non condividerlo con nessuno.
        </p>
      </div>
      <div class="footer">
        <p><?php echo get_bloginfo('name'); ?> - <?php echo get_bloginfo('url'); ?></p>
      </div>
    </div>
  </body>
  </html>
  <?php
  return ob_get_clean();
}

// 6️⃣ — Endpoints REST API per gestire preventivi
add_action('rest_api_init', function() {
  // Endpoint per aggiornare l'email del cliente e inviare notifica
  register_rest_route('wc-quote/v1', 'update-customer-email', [
    'methods' => 'POST',
    'callback' => 'wc_quote_update_customer_email',
    'permission_callback' => function() {
      // Richiede autenticazione come admin o shop_manager
      return current_user_can('manage_woocommerce');
    },
    'args' => [
      'order_id' => [
        'required' => true,
        'type' => 'integer',
        'description' => 'ID dell\'ordine da aggiornare',
        'validate_callback' => function($param) {
          return is_numeric($param) && $param > 0;
        }
      ],
      'email' => [
        'required' => true,
        'type' => 'string',
        'description' => 'Nuova email del cliente',
        'validate_callback' => function($param) {
          return is_email($param);
        }
      ],
      'first_name' => [
        'required' => false,
        'type' => 'string',
        'description' => 'Nome del cliente (opzionale)'
      ],
      'last_name' => [
        'required' => false,
        'type' => 'string',
        'description' => 'Cognome del cliente (opzionale)'
      ],
      'send_email' => [
        'required' => false,
        'type' => 'boolean',
        'default' => true,
        'description' => 'Se inviare l\'email di notifica (default: true)'
      ]
    ]
  ]);

  // Endpoint per recuperare dettagli ordine (pubblico, validato con order_key + email)
  register_rest_route('wc-quote/v1', 'order', [
    'methods' => 'GET',
    'callback' => 'wc_quote_get_order_details',
    'permission_callback' => '__return_true',
    'args' => [
      'order_key' => [
        'required' => true,
        'type' => 'string',
        'description' => 'Order key dell\'ordine',
        'validate_callback' => function($param) {
          return !empty($param) && is_string($param);
        }
      ],
      'email' => [
        'required' => true,
        'type' => 'string',
        'description' => 'Email dell\'utente per verifica',
        'validate_callback' => function($param) {
          return is_email($param);
        }
      ]
    ]
  ]);

  // Endpoint per accettare preventivo (quote -> on-hold)
  register_rest_route('wc-quote/v1', 'convert-to-on-hold', [
    'methods' => 'POST',
    'callback' => 'wc_quote_convert_to_on_hold',
    'permission_callback' => '__return_true', // Validazione interna nella callback
    'args' => [
      'order_key' => [
        'required' => true,
        'type' => 'string',
        'description' => 'Order key dell\'ordine da convertire',
        'validate_callback' => function($param) {
          return !empty($param) && is_string($param);
        }
      ],
      'email' => [
        'required' => true,
        'type' => 'string',
        'description' => 'Email dell\'utente per verifica',
        'validate_callback' => function($param) {
          return is_email($param);
        }
      ]
    ]
  ]);

  // Endpoint per rifiutare preventivo (quote -> cancelled)
  register_rest_route('wc-quote/v1', 'reject-quote', [
    'methods' => 'POST',
    'callback' => 'wc_quote_reject_quote',
    'permission_callback' => '__return_true',
    'args' => [
      'order_key' => [
        'required' => true,
        'type' => 'string',
        'description' => 'Order key dell\'ordine da rifiutare',
        'validate_callback' => function($param) {
          return !empty($param) && is_string($param);
        }
      ],
      'email' => [
        'required' => true,
        'type' => 'string',
        'description' => 'Email dell\'utente per verifica',
        'validate_callback' => function($param) {
          return is_email($param);
        }
      ]
    ]
  ]);
});

function wc_quote_update_customer_email($request) {
  $order_id = absint($request->get_param('order_id'));
  $email = sanitize_email($request->get_param('email'));
  $first_name = $request->get_param('first_name') ? sanitize_text_field($request->get_param('first_name')) : '';
  $last_name = $request->get_param('last_name') ? sanitize_text_field($request->get_param('last_name')) : '';
  $send_email = $request->get_param('send_email') !== false ? (bool) $request->get_param('send_email') : true;

  // Recupera l'ordine
  $order = wc_get_order($order_id);

  if (!$order) {
    return new WP_Error(
      'order_not_found',
      'Ordine non trovato',
      ['status' => 404]
    );
  }

  // Verifica che sia un ordine principale
  if ($order->get_parent_id() !== 0) {
    return new WP_Error(
      'invalid_order',
      'Non è possibile aggiornare un sotto-ordine. Usa l\'ordine principale.',
      ['status' => 400]
    );
  }

  // Verifica che l'ordine sia in stato "quote"
  if ($order->get_status() !== 'quote') {
    return new WP_Error(
      'invalid_status',
      sprintf('L\'ordine deve essere in stato "quote" per aggiornare l\'email. Stato attuale: "%s"', $order->get_status()),
      ['status' => 400]
    );
  }

  // Salva la vecchia email per il log
  $old_email = $order->get_billing_email();

  // Aggiorna i dati di billing
  $order->set_billing_email($email);

  if (!empty($first_name)) {
    $order->set_billing_first_name($first_name);
  }

  if (!empty($last_name)) {
    $order->set_billing_last_name($last_name);
  }

  // Salva le modifiche
  $order->save();

  // Aggiungi nota all'ordine
  if ($old_email !== $email) {
    $order->add_order_note(sprintf(
      'Email cliente aggiornata da "%s" a "%s" tramite API',
      $old_email,
      $email
    ));
  }

  // Invia email se richiesto
  $email_sent = false;
  if ($send_email) {
    $email_sent = wc_quote_send_email_notification($order);
  }

  return [
    'success' => true,
    'message' => 'Email cliente aggiornata con successo',
    'order_id' => $order->get_id(),
    'old_email' => $old_email,
    'new_email' => $email,
    'email_sent' => $email_sent,
    'order_data' => [
      'id' => $order->get_id(),
      'order_number' => $order->get_order_number(),
      'status' => $order->get_status(),
      'billing_email' => $order->get_billing_email(),
      'billing_first_name' => $order->get_billing_first_name(),
      'billing_last_name' => $order->get_billing_last_name(),
      'total' => $order->get_total(),
      'currency' => $order->get_currency(),
    ]
  ];
}

function wc_quote_get_order_details($request) {
  $order_key = sanitize_text_field($request->get_param('order_key'));
  $email = sanitize_email($request->get_param('email'));

  // Valida ordine ed email
  $order = wc_quote_validate_order_and_email($order_key, $email);

  if (is_wp_error($order)) {
    return $order;
  }

  // Prepara i dati dell'ordine in formato leggibile
  $order_data = [
    'id' => $order->get_id(),
    'order_number' => $order->get_order_number(),
    'order_key' => $order->get_order_key(),
    'status' => $order->get_status(),
    'date_created' => $order->get_date_created()->date('Y-m-d H:i:s'),
    'date_modified' => $order->get_date_modified() ? $order->get_date_modified()->date('Y-m-d H:i:s') : null,

    // Totali
    'total' => $order->get_total(),
    'subtotal' => $order->get_subtotal(),
    'tax_total' => $order->get_total_tax(),
    'shipping_total' => $order->get_shipping_total(),
    'discount_total' => $order->get_discount_total(),
    'currency' => $order->get_currency(),
    'formatted_total' => $order->get_formatted_order_total(),

    // Dati cliente
    'billing' => [
      'first_name' => $order->get_billing_first_name(),
      'last_name' => $order->get_billing_last_name(),
      'email' => $order->get_billing_email(),
      'phone' => $order->get_billing_phone(),
      'address_1' => $order->get_billing_address_1(),
      'address_2' => $order->get_billing_address_2(),
      'city' => $order->get_billing_city(),
      'state' => $order->get_billing_state(),
      'postcode' => $order->get_billing_postcode(),
      'country' => $order->get_billing_country(),
    ],

    'shipping' => [
      'first_name' => $order->get_shipping_first_name(),
      'last_name' => $order->get_shipping_last_name(),
      'address_1' => $order->get_shipping_address_1(),
      'address_2' => $order->get_shipping_address_2(),
      'city' => $order->get_shipping_city(),
      'state' => $order->get_shipping_state(),
      'postcode' => $order->get_shipping_postcode(),
      'country' => $order->get_shipping_country(),
    ],

    // Prodotti
    'line_items' => [],

    // Note cliente
    'customer_note' => $order->get_customer_note(),

    // Metodo di pagamento
    'payment_method' => $order->get_payment_method(),
    'payment_method_title' => $order->get_payment_method_title(),
  ];

  // Aggiungi i prodotti
  foreach ($order->get_items() as $item_id => $item) {
    $product = $item->get_product();

    $order_data['line_items'][] = [
      'id' => $item_id,
      'name' => $item->get_name(),
      'product_id' => $item->get_product_id(),
      'variation_id' => $item->get_variation_id(),
      'quantity' => $item->get_quantity(),
      'subtotal' => $item->get_subtotal(),
      'total' => $item->get_total(),
      'tax' => $item->get_total_tax(),
      'sku' => $product ? $product->get_sku() : '',
      'price' => $product ? $product->get_price() : '',
      'image' => $product && $product->get_image_id() ? wp_get_attachment_url($product->get_image_id()) : '',
    ];
  }

  return [
    'success' => true,
    'order' => $order_data
  ];
}

// Funzione helper per validare ordine ed email
function wc_quote_validate_order_and_email($order_key, $email) {
  // Recupera l'ordine tramite order_key
  $order_id = wc_get_order_id_by_order_key($order_key);

  if (!$order_id) {
    return new WP_Error(
      'order_not_found',
      'Ordine non trovato con questa order key',
      ['status' => 404]
    );
  }

  $order = wc_get_order($order_id);

  if (!$order) {
    return new WP_Error(
      'order_not_found',
      'Ordine non trovato',
      ['status' => 404]
    );
  }

  // Verifica che sia un ordine principale (non un sub-order di MultiVendor)
  if ($order->get_parent_id() !== 0) {
    return new WP_Error(
      'invalid_order',
      'Questo è un sotto-ordine. Usa l\'ordine principale.',
      ['status' => 400]
    );
  }

  // Verifica che l'email corrisponda
  if (strtolower($order->get_billing_email()) !== strtolower($email)) {
    return new WP_Error(
      'email_mismatch',
      'L\'email fornita non corrisponde all\'ordine',
      ['status' => 403]
    );
  }

  return $order;
}

function wc_quote_convert_to_on_hold($request) {
  $order_key = sanitize_text_field($request->get_param('order_key'));
  $email = sanitize_email($request->get_param('email'));

  // Valida ordine ed email
  $order = wc_quote_validate_order_and_email($order_key, $email);

  if (is_wp_error($order)) {
    return $order;
  }

  // Verifica che lo stato corrente sia "quote"
  if ($order->get_status() !== 'quote') {
    return new WP_Error(
      'invalid_status',
      sprintf('Lo stato corrente dell\'ordine è "%s", non "quote"', $order->get_status()),
      ['status' => 400]
    );
  }

  // Cambia lo stato a on-hold
  $order->update_status('on-hold', 'Preventivo accettato dal cliente tramite API');

  return [
    'success' => true,
    'message' => 'Ordine convertito con successo da quote a on-hold',
    'order_id' => $order->get_id(),
    'order_key' => $order_key,
    'new_status' => 'on-hold',
    'order_data' => [
      'id' => $order->get_id(),
      'status' => $order->get_status(),
      'total' => $order->get_total(),
      'currency' => $order->get_currency(),
      'date_created' => $order->get_date_created()->date('Y-m-d H:i:s')
    ]
  ];
}

function wc_quote_reject_quote($request) {
  $order_key = sanitize_text_field($request->get_param('order_key'));
  $email = sanitize_email($request->get_param('email'));

  // Valida ordine ed email
  $order = wc_quote_validate_order_and_email($order_key, $email);

  if (is_wp_error($order)) {
    return $order;
  }

  // Verifica che lo stato corrente sia "quote"
  if ($order->get_status() !== 'quote') {
    return new WP_Error(
      'invalid_status',
      sprintf('Lo stato corrente dell\'ordine è "%s", non "quote"', $order->get_status()),
      ['status' => 400]
    );
  }

  // Cambia lo stato a cancelled
  $order->update_status('cancelled', 'Preventivo rifiutato dal cliente tramite API');

  return [
    'success' => true,
    'message' => 'Preventivo rifiutato con successo',
    'order_id' => $order->get_id(),
    'order_key' => $order_key,
    'new_status' => 'cancelled',
    'order_data' => [
      'id' => $order->get_id(),
      'status' => $order->get_status(),
      'total' => $order->get_total(),
      'currency' => $order->get_currency(),
      'date_created' => $order->get_date_created()->date('Y-m-d H:i:s')
    ]
  ];
}