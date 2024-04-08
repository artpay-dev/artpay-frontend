<?php
  $TEMPLATE_PATH = parse_url(get_template_directory_uri(), PHP_URL_PATH);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<?php $BRC_TEMPLATE_PATH = parse_url(get_template_directory_uri(), PHP_URL_PATH); ?>

<meta charset="utf-8" />
    <link rel="shortcut icon" href="/wp-content/themes/artpay-react/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-wptheme"
    />
    <link rel="apple-touch-icon" href="<?php echo $TEMPLATE_PATH; ?>/logo192.png" />
    <link rel="manifest" href="<?php echo $TEMPLATE_PATH; ?>/manifest.json" />

    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="stripe-key" content="pk_test_51OEuLgBVvRJjw4FGCIWYwitCW6xe6KYOfIjoZwENwGLj22ZkaZEg60csVTAg4ZTDwXW1ZksSqY4mXliEPDWVYZ0z00EaPOowQS" />
    <title>Artpay</title>
    <?php wp_head(); ?>
      <script type="module" crossorigin src="/wp-content/themes/artpay-react/static/assets/js/index-20dcf5a6.js"></script>
      <link rel="stylesheet" href="/wp-content/themes/artpay-react/static/assets/css/index-244fb1a6.css">
    </head>
    <body>
    <noscript>
        You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
    
    <?php wp_footer(); ?>
    </body>
</html>

