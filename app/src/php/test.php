<?php

require './DBManager.php';

$name = 'TEST';

$hostname = 'mysql.invmngr';
$dbName = 'inventory';
$dbUser = 'accounting';
$pwd = 'accountingpassword';

$connection = new PDO('mysql:host=' . $hostname . ';dbname=' . $dbName . ';charset=utf8', $dbUser, $pwd, array(PDO::MYSQL_ATTR_LOCAL_INFILE => true));
$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// Begin transaction
$connection->beginTransaction();

$sql = 'INSERT INTO current_metadata (name) VALUES (:name)';
$statement = $connection->prepare($sql);
$statement->bindParam(':name', $name);
$result = $statement->execute();

$sql = "TRUNCATE TABLE current";
$result &= $connection->exec($sql);
$sql = "LOAD DATA LOCAL INFILE '/var/userdata/preisliste.csv' INTO TABLE current FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES (`name`, `price`, `category`)";
$result &= $connection->exec($sql);

// Update values from last session into current if it exists
// if (self::lastExists()) {
//   $sql = "UPDATE current INNER JOIN last_values ON current.name = last_values.name SET current.last = last_values.amount";
//   $result &= $connection->query($sql);
// }
if ($result) {
  $result = $connection->commit();
} else {
  $connection->rollBack();
}

echo $result;

?>
