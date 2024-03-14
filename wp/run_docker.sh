docker stop artpay-wp && docker rm artpay-wp
docker stop artpay-mysql && docker rm artpay-mysql

#docker exec artpay-wp tar -czf /tmp/html_backup.tar.gz /var/www/html
#docker cp artpay-wp:/tmp/html_backup.tar.gz ./
#/etc/certs/key.pem
#SSLEngine on
#SSLCertificateFile /etc/certs/cert.pem
#SSLCertificateKeyFile /etc/certs/key.pem

docker run --name artpay-mysql -v $PWD/db:/var/lib/mysql --network artpay -e MYSQL_ROOT_PASSWORD=cBZ7y9lrq3Oe0K1MWLYk82o6E5jxGub4 -e MYSQL_DATABASE=artpay -e MYSQL_USER=artpay -e MYSQL_PASSWORD=cBZ7y9lrq3Oe0K1MWLYk82o6E5jxGub4  -d mysql:latest
docker run --name artpay-wp --network artpay -v $PWD/theme:/var/www/html/wp-content/themes/artpay-react -v $PWD/wp-data:/var/www/html -v $PWD/certs:/etc/certs -v $PWD/uploads.ini:/usr/local/etc/php/conf.d/uploads.ini -e WORDPRESS_DB_HOST=artpay-mysql -e WORDPRESS_DB_USER=artpay -e WORDPRESS_DB_PASSWORD=cBZ7y9lrq3Oe0K1MWLYk82o6E5jxGub4 -e WORDPRESS_DB_NAME=artpay -d wordpress:5.8.1-php7.4-apache