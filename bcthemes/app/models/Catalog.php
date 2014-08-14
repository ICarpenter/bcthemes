<?php

class Catalog extends Eloquent {

	public function getAll() {
		$client = new \GuzzleHttp\Client();
		$response = $client->get('https://api.myjson.com/bins/12ab8');
		return $response->json();
	}

	public function getCategories() {
		$client = new \GuzzleHttp\Client();
		$response = $client->get('http://s1407437177.bcapp.dev/api/v3/catalog/categories');
		return $response->json();
	}

}
