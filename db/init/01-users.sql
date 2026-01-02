-- Create service users and grant schema-level privileges.
CREATE USER IF NOT EXISTS 'catalog_user'@'%' IDENTIFIED BY 'catalog_pw';
GRANT ALL PRIVILEGES ON catalog_db.* TO 'catalog_user'@'%';

CREATE USER IF NOT EXISTS 'commerce_user'@'%' IDENTIFIED BY 'commerce_pw';
GRANT ALL PRIVILEGES ON commerce_db.* TO 'commerce_user'@'%';

CREATE USER IF NOT EXISTS 'payment_user'@'%' IDENTIFIED BY 'payment_pw';
GRANT ALL PRIVILEGES ON payment_db.* TO 'payment_user'@'%';

FLUSH PRIVILEGES;
