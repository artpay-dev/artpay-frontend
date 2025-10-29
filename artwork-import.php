<?php
/*
 * Plugin Name: Mirko Artwork Import
 * Plugin URI: https://artpay.art/wp-admin/admin.php?import=artworks
 * Description: Import excel data to WordPress
 * Author: Mirko Peloso
 * Version: 1.0
 * Author URI: https://artpay.art
 */
/*
require_once(plugin_dir_path( __DIR__ ).'woocommerce/includes/abstracts/abstract-wc-data.php');
require_once(plugin_dir_path( __DIR__ ).'woocommerce/includes/legacy/abstract-wc-legacy-product.php');
require_once(plugin_dir_path( __DIR__ ).'woocommerce/includes/abstracts/abstract-wc-product.php');
require_once(plugin_dir_path( __DIR__ ).'woocommerce/includes/class-wc-product-simple.php');
 */

add_action('wp_loaded', 'mirko_importer_init');
function mirko_importer_init()
{
    defined('ABSPATH') || exit;
    include_once ABSPATH . 'wp-admin/includes/plugin.php';
    include_once WP_PLUGIN_DIR . '/woocommerce/woocommerce.php';

    $plugin_path = trailingslashit(WP_PLUGIN_DIR) . 'woocommerce/woocommerce.php';
    if (
        (in_array($plugin_path, wp_get_active_and_valid_plugins())
            || in_array($plugin_path, wp_get_active_network_plugins()))
        && is_plugin_active('advanced-custom-fields/acf.php')
    ) {

        if (isset($_GET['import']) and $_GET['import'] == 'artworks') {

            global $wpdb;

            $json = file_get_contents(dirname(__FILE__) . '/opere_da_importare.json');

            error_log($json);

            if ($json) {
                $data = json_decode($json, true);

                // Each data
                foreach ($data as $item) {
                    $product = new WC_Product_Simple();

                    $artists=null;
                    $artist=null;

                    // Create post object
                    error_log("\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\nJSON ORIGINALE : " . json_encode($item));

                    // GALLERIA
                    $query = $wpdb->prepare("SELECT * FROM {$wpdb->prefix}users WHERE user_nicename = %s or ID=%d or user_login = %s",
                        $item['ID Galleria*'], intval($item['ID Galleria*']), $item['ID Galleria*']);
                    $results = $wpdb->get_row($query, ARRAY_A);

                    error_log(json_encode($results));

                    if($results && isset($results['ID'])){
                        $idGallery=$results['ID'];
                        error_log("Detected id gallery ".$idGallery);
                    }else{
                        error_log("Id gallery not recognized :". $item['ID Galleria*']);
                        die();
                    }


                    $existingProductId = wc_get_product_id_by_sku($item['SKU*']);
                    if ($existingProductId) {

                        error_log("Product yet imported :  " . $item['SKU*']);
                        $product = new WC_Product_Simple($existingProductId);

                    }

                    error_log("Looking for artist :  " . $item['Autore*']);
                    $args = array(
                        'name'           => $item['Autore*'],
                        'post_type'      => 'artisti',
                        'posts_per_page' => 1,
                    );
                    $artists = get_posts($args);

                    if (count($artists) > 0) {
                        $artist = $artists[0];
                        error_log("Artist yet created :  " . json_encode($artist));
                        update_post_meta($artist->ID, '_birth_nation', 'field_6551ff50f4eef');
                        update_post_meta($artist->ID, '_birth_year', 'field_6551ff71f4ef0');
                        update_post_meta($artist->ID, '_location', 'field_6551ff84f4ef1');
                        update_post_meta($artist->ID, 'birth_year', $item['Anno di nascita Autore*']);
                        update_post_meta($artist->ID, 'birth_nation', $item['Nazionalità Autore*']);
                        update_post_meta($artist->ID, 'location', $item['Nazionalità Autore*']);
                        $artistId = $artist->ID;
                    } else {
                        error_log("Artist not found... creating new" . $item['Autore*']);
                        $artist = array(
                            'post_title'    => $item['Autore*'],
                            'post_content'  => '',
                            'post_status'   => 'publish',
                            'post_date'     => date('Y-m-d H:i:s'),
                            'post_author'   => $idGallery,
                            'post_type'     => 'artisti',
                            'post_category' => [],
                        );
                        $artist_id = wp_insert_post($artist);

                        error_log("Artist " . $item['Autore*'] . " imported with id " . $artist_id);
                        update_post_meta($artist['ID'], '_birth_nation', 'field_6551ff50f4eef');
                        update_post_meta($artist['ID'], '_birth_year', 'field_6551ff71f4ef0');
                        update_post_meta($artist['ID'], '_location', 'field_6551ff84f4ef1');
                        update_post_meta($artist['ID'], 'birth_year', $item['Anno di nascita Autore*']);
                        update_post_meta($artist['ID'], 'birth_nation', $item['Nazionalità Autore*']);
                        update_post_meta($artist['ID'], 'location', $item['Nazionalità Autore*']);
                        if (!$artist_id) {
                            error_log("Artist not created :  " . $item['Autore*']);
                        }
                    }

                    $product->set_name($item['Titolo Opera*']); // Name (title).
                    $product->set_slug(sanitize_title($item['Titolo Opera*']));

                    $product->set_description($item['Descrizione completa*']);
                    $product->set_short_description($item['Breve descrizione*']);

                    // Prices
                    $product->set_regular_price($item['Prezzo*']);
                    //$product->set_sale_price( isset( $args['sale_price'] ) ? $args['sale_price'] : '' );
                    //$product->set_price( isset( $args['sale_price'] ) ? $args['sale_price'] :  $args['regular_price'] );
                    /* if( isset( $args['sale_price'] ) ){
                    $product->set_date_on_sale_from( isset( $args['sale_from'] ) ? $args['sale_from'] : '' );
                    $product->set_date_on_sale_to( isset( $args['sale_to'] ) ? $args['sale_to'] : '' );
                    }*/

                    //if ( get_option( 'woocommerce_calc_taxes' ) === 'yes' ) {
                    //    $product->set_tax_status(   'taxable' );
                    //    $product->set_tax_class(  isset($args['tax_class']) ? $args['tax_class'] : '' );
                    //}

                    if (!$existingProductId) {
                        $product->set_sku($item['SKU*']);
                    }

                    $product->set_manage_stock(true);
                    $product->set_stock_status('instock');
                    $product->set_stock_quantity(1);
                    $product->set_stock_status(1);
                    $product->set_backorders('no');

                    $product->set_weight(isset($item['Peso']) ? $item['Peso'] : '');
                    $product->set_length(isset($item['Altezza*']) ? $item['Altezza*'] : '');
                    $product->set_width(isset($item['Larghezza*']) ? $item['Larghezza*'] : '');
                    $product->set_height(isset($item['Spessore*']) ? $item['Spessore*'] : '');

                    /*if( isset( $item['category_ids'] ) )
                    $product->set_category_ids( $item['category_ids'] );
                    if( isset( $item['tag_ids'] ) )
                    $product->set_tag_ids( $item['tag_ids'] );
                     */
                    $product->set_status('draft');
                    $product->set_catalog_visibility('visible');
                    $product->set_featured(false);
                    $product->set_virtual(false);
                    $product->set_downloadable(false);
                    $product->set_reviews_allowed(false);
                    $product->set_sold_individually(true);

                    error_log("OGGETTO FINALE:  " . json_encode($product->get_data()) . "\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n");

                    $product_id = $product->get_id();
                    $product_id = $product->save();

                    $my_post = array(
                        'ID'           => $product_id,
                        'post_author'   => $idGallery,
                    );

                    wp_update_post( $my_post );

                    update_post_meta($product_id, '_artist', 'field_6539eb6807ae2');
                    update_post_meta($product_id, '_anno_di_produzione', 'field_65840077e47f0');
                    update_post_meta($product_id, '_condizioni', 'field_65843e17a63f8');
                    update_post_meta($product_id, '_estimated_shipping_cost', 'field_65c9e10448e0c');

                    update_post_meta($product_id, 'artist', $artistId);
                    update_post_meta($product_id, 'condizioni', $item['Condizioni opera*']);
                    update_post_meta($product_id, 'anno_di_produzione', $item['Anno*']);
                    update_post_meta($product_id, 'estimated_shipping_cost', $item['Costo spedizione stimata*']);

                    update_post_meta($product_id, '_commission_percentage_per_product', 12);
                    update_post_meta($product_id, 'visible_frontend', $item['Frontend']?true:false);

                    $termsToInsert = [];

                    //CARTIFICATO
                    if (strcasecmp($item['Certificato*'], 'si') == 0) {
                        $category = get_term_by('slug', 'incluso-certificato', 'product_cat');

                    } else {
                        $category = get_term_by('slug', 'non-incluso-certificato', 'product_cat');
                    }
                    error_log("Category : " . json_encode($category));
                    array_push($termsToInsert, $category->term_id);

                    // FIRMA
                    if (strcasecmp($item['Firma'], 'si') == 0) {
                        $category = get_term_by('slug', 'inclusa-firma', 'product_cat');

                    } else {
                        $category = get_term_by('slug', 'esclusa-firma', 'product_cat');
                    }
                    error_log("Category : " . json_encode($category));
                    array_push($termsToInsert, $category->term_id);

                    //CORNICE
                    if (strcasecmp($item['Cornice'], 'si') == 0) {
                        $category = get_term_by('slug', 'inclusa-cornice', 'product_cat');

                    } else {
                        $category = get_term_by('slug', 'esclusa-cornice', 'product_cat');
                    }
                    error_log("Category : " . json_encode($category));
                    array_push($termsToInsert, $category->term_id);

                    //Opera unica o multipli*
                    if (strcasecmp($item['Opera unica o multipli*'], 'Opera Unica') == 0) {
                        $category = get_term_by('slug', 'opera-unica', 'product_cat');

                    } else   if (strcasecmp($item['Opera unica o multipli*'], 'Edizione Aperta') == 0){
                        $category = get_term_by('slug', 'edizione-aperta', 'product_cat');
                    }
                    else   if (strcasecmp($item['Opera unica o multipli*'], 'Edizione Limitata') == 0){
                        $category = get_term_by('slug', 'edizione-limitata', 'product_cat');
                    }
                    error_log("Category : " . json_encode($category));
                    array_push($termsToInsert, $category->term_id);

                    //Materiale
                    if(isset($item['Materiale'])){
                        if (strcasecmp($item['Materiale'], 'Resina') == 0) {
                            $category = get_term_by('slug', 'resina-materiale', 'product_cat');

                        } else if (strcasecmp($item['Materiale'], 'Acrilico') == 0) {
                            $category = get_term_by('slug', 'acrilico-materiale', 'product_cat');

                        }
                        else  {
                            $category = get_term_by('slug', sanitize_title($item['Materiale']), 'product_cat');
                        }
                        error_log("Category : " . json_encode($category));
                        array_push($termsToInsert, $category->term_id);
                    }

                    //Tecnica
                    if(isset($item['Tecnica'])){

                        $category = get_term_by('slug', sanitize_title($item['Tecnica']), 'product_cat');

                        error_log("Category : " . json_encode($category));
                        array_push($termsToInsert, $category->term_id);
                    }

                    //Stile
                    if(isset($item['Stile'])){

                        $category = get_term_by('slug', sanitize_title($item['Stile']), 'product_cat');

                        error_log("Category : " . json_encode($category));
                        array_push($termsToInsert, $category->term_id);
                    }

                    //Stile
                    if(isset($item['Tipologia'])){

                        $category = get_term_by('slug', sanitize_title($item['Tipologia']), 'product_cat');

                        error_log("Category : " . json_encode($category));
                        array_push($termsToInsert, $category->term_id);
                    }

                    //Colore
                    if(isset($item['Colore'])){

                        $category = get_term_by('slug', sanitize_title($item['Colore']), 'product_cat');

                        error_log("Category : " . json_encode($category));
                        array_push($termsToInsert, $category->term_id);
                    }

                    //Periodo
                    if(isset($item['Periodo'])){

                        $category = get_term_by('slug', sanitize_title($item['Periodo']), 'product_cat');

                        error_log("Category : " . json_encode($category));
                        array_push($termsToInsert, $category->term_id);
                    }

                    //Tema
                    if(isset($item['Tema'])){

                        $category = get_term_by('slug', sanitize_title($item['Tema']), 'product_cat');

                        error_log("Category : " . json_encode($category));
                        array_push($termsToInsert, $category->term_id);
                    }


                    error_log("Inserting categories in product :" . json_encode($termsToInsert));
                    $product->set_category_ids($termsToInsert);
                    $product->save();
                    /*
                    //Images and Gallery
                    */
                    $sql = $wpdb->prepare("SELECT * FROM  $wpdb->posts WHERE  post_type = 'attachment' and guid like %s order by post_date desc", '%'.$item['SKU*'].".jpg%");
                    $attachments = $wpdb->get_results($sql, OBJECT);
                    $attachment_id = $attachments[0]->ID ?? false;
                    if(!$attachment_id){
                        $sql = $wpdb->prepare("SELECT * FROM  $wpdb->posts WHERE  post_type = 'attachment' and guid like %s order by post_date desc", '%'.$item['SKU*'].".jpeg%");
                        $attachments = $wpdb->get_results($sql, OBJECT);
                        $attachment_id = $attachments[0]->ID ?? false;
                        if(!$attachment_id){
                            $sql = $wpdb->prepare("SELECT * FROM  $wpdb->posts WHERE  post_type = 'attachment' and guid like %s order by post_date desc", '%'.$item['SKU*'].".png%");
                            $attachments = $wpdb->get_results($sql, OBJECT);
                            $attachment_id = $attachments[0]->ID ?? false;
                        }
                    }
                    error_log("Detected from media ". $item['SKU*'] ." image id :".$attachment_id);
                    if($attachment_id){
                        $product->set_image_id($attachment_id);
                        /*

                        $product->set_gallery_image_ids( isset( $args['gallery_ids'] ) ? $args['gallery_ids'] : array() );
                        */
                        $product->save();
                    }
                }
            }
            error_log("IMPORT TERMINATED. \r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n");

            exit;
        }
    } else {
        error_log("Missing WC or ACF plugins. Import not started.");
    }

}
