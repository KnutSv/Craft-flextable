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

namespace knutsv\flextable\fields;

use knutsv\flextable\FlexTable;
use knutsv\flextable\assetbundles\flextablefieldfield\FlexTableFieldFieldAsset;

use Craft;
use craft\base\ElementInterface;
use craft\base\Field;
use craft\helpers\Db;
use yii\db\Schema;
use craft\helpers\Json;

/**
 * @author    Knut Svangstu
 * @package   FlexTable
 * @since     2.0.0
 */
class FlexTableField extends Field
{
    // Public Properties
    // =========================================================================

    /**
     * @var string
     */
    public $someAttribute = '{"thead":[],"tbody":[],"tfoot":[],"meta":{"caption":""}}';

    // Static Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public static function displayName(): string
    {
        return Craft::t('flex-table', 'Flex table');
    }

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function rules()
    {
        $rules = parent::rules();
        $rules = array_merge($rules, [
            ['someAttribute', 'string'],
            ['someAttribute', 'default', 'value' => '{"thead":[],"tbody":[],"tfoot":[],"meta":{"caption":""}}'],
        ]);
        return $rules;
    }

    /**
     * @inheritdoc
     */
    public function getContentColumnType(): string
    {
        return Schema::TYPE_TEXT;
    }

    /**
     * @inheritdoc
     */
    public function normalizeValue($value, ElementInterface $element = null)
    {
        return craft\helpers\Json::decode($value);
    }

    /**
     * @inheritdoc
     */
    public function serializeValue($value, ElementInterface $element = null)
    {
        return craft\helpers\Json::encode($value);
    }

    /**
     * @inheritdoc
     */
/*    public function getSettingsHtml()
    {
        // Render the settings template
        return Craft::$app->getView()->renderTemplate(
            'flex-table/_components/fields/FlexTableField_settings',
            [
                'field' => $this,
            ]
        );
    }*/

    /**
     * @inheritdoc
     */
    public function getInputHtml($value, ElementInterface $element = null): string
    {
        // Register our asset bundle
        Craft::$app->getView()->registerAssetBundle(FlexTableFieldFieldAsset::class);

        // Get our id and namespace
        $id = Craft::$app->getView()->formatInputId($this->handle);
        $namespacedId = Craft::$app->getView()->namespaceInputId($id);

        // Render the input template
        return Craft::$app->getView()->renderTemplate(
            'flex-table/_components/fields/FlexTableField_input',
            [
                'name' => $this->handle,
                'value' => $value,
                'field' => $this,
                'id' => $id,
                'namespacedId' => $namespacedId,
            ]
        );
    }
}
