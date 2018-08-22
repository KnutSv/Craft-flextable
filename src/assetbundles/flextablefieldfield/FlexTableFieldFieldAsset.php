<?php
/**
 * FlexTable plugin for Craft CMS 3.x
 *
 * 
This field type makes creating and editing tables in Craft a breeze.
 *
 * @link      https://vangenplotz.no/
 * @copyright Copyright (c) 2018 Knut Svangstu
 */

namespace knutsv\flextable\assetbundles\flextablefieldfield;

use Craft;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

/**
 * @author    Knut Svangstu
 * @package   FlexTable
 * @since     2.0.0
 */
class FlexTableFieldFieldAsset extends AssetBundle
{
    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        $this->sourcePath = "@knutsv/flextable/assetbundles/flextablefieldfield/dist";

        $this->depends = [
            CpAsset::class,
        ];

        $this->js = [
            'js/FlexTableField.js',
        ];

        $this->css = [
            'css/FlexTableField.css',
        ];

        parent::init();
    }
}
