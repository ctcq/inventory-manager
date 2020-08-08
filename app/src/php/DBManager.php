<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * This static class manages all communication between the SQL database
 * and the frontend
 */
class DBManager {

  private static function getConnection() {
    $hostname = 'mysql.invmngr';
    $dbName = 'inventory';
    $dbUser = 'accounting';
    $pwd = 'accountingpassword';

    $connection = new PDO('mysql:host=' . $hostname . ';dbname=' . $dbName . ';charset=utf8', $dbUser, $pwd, array(PDO::MYSQL_ATTR_LOCAL_INFILE => true));
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $connection;
  }

  /**
   * Checks if entry for session metadata exists.
   * @return boolean true only if session is ongoing
   */
  public static function isSessionOngoing() {
    try {
      $connection = self::getConnection();
      $sql = 'SELECT COUNT(active) as num FROM current_metadata';
      $result = $connection->query($sql);
      if($result) {
        $rowExists = $result->fetchColumn(0) > 0;
      } else {
        throw new PDOException("Invalid Query.");
      }
      return $rowExists;
    } catch (PDOException $e) {
      $result = "Error while looking for ongoing session:" . $e->getMessage();
      return $result;
    }
  }
/*
  public static function setSessionMetadata($name) {
    try {
      $connection = self::getConnection();
      $sql = 'INSERT INTO current_metadata (name) VALUES (:name)';
      $statement = $connection->prepare($sql);
      $statement->bindParam(':name', $name);
      $result = $statement->execute();
      return $result;
    } catch (PDOException $e) {
      $result = "Error while looking for ongoing session:" . $e->getMessage();
      return $result;
    }
  }
*/
  /**
   * Fetches current sessions metadata like name, comments, time
   * @return array
   */
  public static function getSessionMetadata() {
    try {
      $connection = self::getConnection();
      $sql = 'SELECT * FROM current_metadata';
      $statement = $connection->prepare($sql);
      $result = $statement->execute();
      return $statement->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      $result = "Error while looking for ongoing session:" . $e->getMessage();
      return $result;
    }
  }

  /**
   * @return array Associative array with data from current table
   */
  public static function getCurrentBardienstData() {
    try {
      $connection = self::getConnection();
      $sql = 'SELECT * FROM current';
      $statement = $connection->prepare($sql);
      $result = $statement->execute();
      return $statement->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      $result = "Error while fetching current data from database:" . $e->getMessage();
      return $result;
    }
  }

  /**
   * Update current table with some value
   * @param int $id Unique id of the row
   * @param boolean $before Whether the 'before' or the 'after' row should be updated
   * @param int $value New value
   */
  public static function setColumnValue($id, $before, $value) {
    try {
      $connection = self::getConnection();
      if ($before) {
        $sql = "UPDATE current SET `before` = :value WHERE id = :id";
      } else {
        $sql = "UPDATE current SET `after` = :value WHERE id = :id";
      }
      $statement = $connection->prepare($sql);
      $statement->bindParam(':id', $id);
      $statement->bindParam(':value', $value);
      $result = $statement->execute();
      return $result;
    } catch (PDOException $e) {
      $result = "Error updating current table:" . $e->getMessage();
      return $result;
    }
  }

  public static function getColumnValue($id, $before) {
    try {
      $connection = self::getConnection();
      if ($before) {
        $col = 'before';
        $sql = "SELECT `before` FROM current WHERE id = :id";
      } else {
        $col = 'after';
        $sql = "SELECT `after` FROM current WHERE id = :id";
      }
      $statement = $connection->prepare($sql);
      $statement->bindParam(':id', $id);
      $result = $statement->execute();
      return $statement->fetch(PDO::FETCH_ASSOC)[$col];
    } catch (PDOException $e) {
      $result = "Error fetching value from current table:" . $e->getMessage();
      return $result;
    }
  }

  /**
   * Inserts comment into database
   * @param boolean $public Whether this is public or private comment
   * @param string $text Comment to be inserted
   */
  public static function setComment($public, $text) {
    $columnName = $public ? 'comment_public' : 'comment_private';
    try {
      $connection = self::getConnection();
      $sql = "UPDATE current_metadata SET $columnName = :text WHERE `active` = '1'";
      $statement = $connection->prepare($sql);
      $statement->bindParam(':text', $text);
      $result = $statement->execute();
      return true;
    } catch (PDOException $e) {
      $result = "Error updating comment:" . $e->getMessage();
      return $result;
    }
  }
/*
  private static function truncateCurrent() {
    try {
      // Load data from csv directly into current table
      $connection = self::getConnection();
      $sql = "TRUNCATE TABLE current";
      $result = $connection->query($sql);
      return $result;
    } catch (PDOException $e) {
      $result = "Error truncating current:" . $e->getMessage();
      return $result;
    }
  }
*/

  /**
   * Function creates new table and adds $name to current metadata
   * @param  [type] $name [description]
   * @return [type]       [description]
   */
  public static function putTableData($name) {
    try {
      // Load data from csv directly into current table
      $connection = self::getConnection();
      $connection->beginTransaction();

      $sql = "TRUNCATE TABLE current_metadata";
      $connection->exec($sql);
      
      $sql = 'INSERT INTO current_metadata (name) VALUES (:name)';
      $statement = $connection->prepare($sql);
      $statement->bindParam(':name', $name);
      $statement->execute();
      $sql = "TRUNCATE TABLE current";
      $connection->exec($sql);
      $sql = "LOAD DATA LOCAL INFILE '/var/userdata/preisliste.csv' INTO TABLE current CHARACTER SET UTF8 FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES (`name`, `price`, `category`)";
      $connection->exec($sql);

      // Update values from last session into current if it exists
      if (self::lastExists()) {
        $sql = "UPDATE current INNER JOIN last_values ON current.name = last_values.name SET current.last = last_values.amount";
        $connection->exec($sql);
      }

      $connection->commit();
      return true;
    } catch (PDOException $e) {
      $connection->rollBack();
      $result = "Error inserting into current:" . $e->getMessage();
      return $result;
    }
  }

  /**
   * Copies data in the database so the next session can be started
   * with data from the current session
   * @return boolean Whether the action was successfull
   */
  public static function finalizeTable($name) {
    // First check if table is finished
    try {
      $connection = self::getConnection();
      $connection->beginTransaction();

      // Export current as csv
      $sql = "SELECT * FROM current INTO OUTFILE '/saves/"
            . time() . "-" . mysqli_real_escape_string($name). ".csv' "
            ."FIELDS ENCLOSED BY '\"' " 
            ."TERMINATED BY ';' " 
            ."ESCAPED BY '\"' " 
            ."LINES TERMINATED BY '\\r\\n'";
      $statement = $connection->prepare($sql);
      $statement->bindParam(':name', $name);
      $statement->execute();

      // Remove row from last_metadata
      $sql = "TRUNCATE TABLE last_metadata";
      $connection->exec($sql);
      // Remove all rows from last_values
      $sql = "TRUNCATE TABLE last_values";
      $connection->exec($sql);
      // insert current metadate into last metadata
      $sql =  "INSERT INTO last_metadata (`name`, `time`, `comment_private`, `comment_public`) " .
              "SELECT `name`, `time`, `comment_private`, `comment_public` " .
              "FROM current_metadata WHERE `active` = '1'";
      $connection->exec($sql);
      // Copy current.last into last_values
      $sql =  "INSERT INTO last_values (`name`, `amount`) " .
              "SELECT `name`, `after` AS`amount` FROM current";
      $connection->exec($sql);
      // Remove row from current_metadata
      $sql = "TRUNCATE TABLE current_metadata";
      $connection->exec($sql);
      // Remove all rows from current
      $sql = "TRUNCATE TABLE current";
      $connection->exec($sql);

      $connection->commit();
      return true;
    } catch (PDOException $e) {
      $connection->rollBack();
      $result = "Error inserting into current:" . $e->getMessage();
      return $result;
    }
  }

  public static function lastExists() {
    try {
      $connection = self::getConnection();
      $sql = 'SELECT COUNT(`active`) FROM last_metadata';
      $result = $connection->query($sql);
      return $result->fetchColumn(0) > 0;
    } catch (PDOException $e) {
      return $result;
    }
  }

  public static function getLastMetadata() {
    try {
      $connection = self::getConnection();
      $sql = 'SELECT * FROM last_metadata';
      $result = $connection->query($sql);
      return $result->fetchAll(PDO::FETCH_ASSOC)[0];
    } catch (PDOException $e) {
      return false;
    }
  }
}

?>
