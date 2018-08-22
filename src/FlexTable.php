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

namespace knutsv\flextable;

use knutsv\flextable\fields\FlexTableField as FlexTableFieldField;

use Craft;
use craft\base\Plugin;
use craft\services\Plugins;
use craft\events\PluginEvent;
use craft\services\Fields;
use craft\events\RegisterComponentTypesEvent;

use yii\base\Event;

/**
 * Class FlexTable
 *
 * @author    Knut Svangstu
 * @package   FlexTable
 * @since     2.0.0
 *
 */
class FlexTable extends Plugin
{
    // Static Properties
    // =========================================================================

    /**
     * @var FlexTable
     */
    public static $plugin;

    // Public Properties
    // =========================================================================

    /**
     * @var string
     */
    public $schemaVersion = '2.0.0';

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();
        self::$plugin = $this;

        Event::on(
            Fields::class,
            Fields::EVENT_REGISTER_FIELD_TYPES,
            function (RegisterComponentTypesEvent $event) {
                $event->types[] = FlexTableFieldField::class;
            }
        );

        Event::on(
            Plugins::class,
            Plugins::EVENT_AFTER_INSTALL_PLUGIN,
            function (PluginEvent $event) {
                if ($event->plugin === $this) {
                }
            }
        );

        Craft::info(
            Craft::t(
                'flex-table',
                '{name} plugin loaded',
                ['name' => $this->name]
            ),
            __METHOD__
        );
    }

    // Protected Methods
    // =========================================================================

}
