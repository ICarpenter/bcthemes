<?php

class IndexController extends BaseController {

	public function indexAction()
	{	
		$model = new Catalog();
		$catalog = $model->getAll();
		$categories = $model->getCategories();
		View::share('categories', $categories);
		View::share('catalog', $catalog);
		return View::make('pages.index');
	}

}
