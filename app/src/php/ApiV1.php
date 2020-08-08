<?php
require_once 'DBManager.php';
require_once 'Balance.php';
$method = $_SERVER['REQUEST_METHOD'];
$n1 = filter_input(INPUT_GET, 'first', FILTER_SANITIZE_STRING);
$n2 = filter_input(INPUT_GET, 'second', FILTER_SANITIZE_STRING);
$n3 = filter_input(INPUT_GET, 'third', FILTER_SANITIZE_STRING);
$n4 = filter_input(INPUT_GET, 'fourth', FILTER_SANITIZE_STRING);

header('Content-Type: text/html; charset=utf-8');
$response = null;

//echo "1: $n1; 2: $n2; 3: $n3; 4: $n4";
if ($method === 'GET' && $n1 === 'metadata' && $n2 ==='active' && $n3 === null && $n4 === null) {
  $response = DBManager::isSessionOngoing();
  $response = $response === true ? "1" : ($response === false ? "0" : $response);
} else if ($method === 'GET' && $n1 === 'metadata' && $n2 === null && $n3 === null && $n4 === null) {
  $response = DBManager::getSessionMetadata();
  $response = $response === false ? "0" : json_encode($response);
} else if ($method === 'PUT' && $n1 === 'tabledata' && $n2 === 'name' && $n3 !== null && $n4 === null) {
  $response = DBManager::putTableData(base64_decode($n3));
  $response = $response === true ? "1" : ($response === false ? "0" : $response);
} else if ($method === 'GET' && $n1 === 'tabledata' && $n2 === null && $n3 === null && $n4 === null) {
  $response = json_encode(DBManager::getCurrentBardienstData());
} else if ($method === 'GET' && $n1 === 'tabledata' && $n2 !== null && ($n3 === 'before' || $n3 === 'after') && $n4 === null) {
  $response = DBManager::getColumnValue($n2, $n3 === 'before');
  $response = $response === false ? "NULL" : $response;
} else if ($method === 'POST' && $n1 === 'tabledata' && $n2 !== null && ($n3 === 'before' || $n3 === 'after') && $n4 !== null) {
  $response = DBManager::setColumnValue($n2, $n3 === 'before', $n4);
  $response = $response === true ? "1" : ($response === false ? "0" : $response);
} else if ($method === 'POST' && $n1 === 'metadata' && $n2 === 'comment_private' && $n3 !== null && $n4 === null) {
  $response = DBManager::setComment(false, base64_decode($n3));
} else if ($method === 'DELETE' && $n1 === 'metadata' && $n2 === 'comment_private' && $n3 === null && $n4 === null) {
  $response = DBManager::setComment(false, '');
} else if ($method === 'POST' && $n1 === 'metadata' && $n2 === 'comment_public' && $n3 !== null && $n4 === null) {
  $response = DBManager::setComment(true, base64_decode($n3));
} else if ($method === 'DELETE' && $n1 === 'metadata' && $n2 === 'comment_public' && $n3 === null && $n4 === null) {
  $response = DBManager::setComment(true, '');
} else if ($method === 'GET' && $n1 === 'metadata' && $n2 === 'complete') {
  $response = Balance::isComplete() === false ? "0" : "1";
} else if ($method === 'POST' && $n1 === 'finish') {
  if (Balance::isComplete() === false) return "0";
  $result = DBManager::finalizeTable($_POST['name']);
  $response = $result === true ? "1" : $result;
} else if ($method === 'GET' && $n1 === 'metadata' && $n2 === 'balance') {
  $response = json_encode(Balance::getBalance());
} else if ($method === 'GET' && $n1 === 'last') {
  if (!DBManager::lastExists()) return '0';
  $response = json_encode(DBManager::getLastMetadata());
} else {
  http_response_code(404);
}


if($response === null){
  http_response_code(500);
} else {
  http_response_code(200);
}
echo $response;
?>
