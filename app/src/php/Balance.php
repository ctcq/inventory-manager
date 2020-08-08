<?php
/*
 * Contains functions for calculating balance and other
 * helper functions associated with completing a Bardienst.
 */
require_once('DBManager.php');

 class Balance {
    /**
     * @return bool Whether the current session is complete
     */
    public static function isComplete() : bool {
        $tableData = DBManager::getCurrentBardienstData();
        
        // Iterate through data and look for missing data
        foreach($tableData as $row) {
            if ($row['before'] == null || $row['after'] == null) {
                return false;
            }

            // If no missing data has been found, return true
            return true;
        }
    }

    public static function getBalance() : array {
        $tableData = DBManager::getCurrentBardienstData();
        $data = [
            'money_before' => $tableData[0]['before'],
            'money_after' => $tableData[0]['after'],
            'money_diff' => 0,
            'articles_before' => 0,
            'articles_after' => 0,
            'articles_diff' => 0,
            'balance' => 0            
        ];

        foreach ($tableData as $row) {
            $price = intval(floatval($row['price']) * 100); // Price in cents
            $data['articles_before'] += $price * $row['before'];
            $data['articles_after'] += $price * $row['after'];
        }
        
        $data['money_diff'] = $data['money_after'] - $data['money_before'];
        $data['articles_diff'] = $data['articles_after'] - $data['articles_before'];
        
        // Calculate balance
        $data['balance'] = $data['articles_diff'] + $data['money_diff'];

        // Format back from cents to euros
        foreach($data as &$cell) {
            $cell /= 100;
            $cell = number_format((float)$cell, 2, ',', '');
        }
        
        return $data;
    }
 }