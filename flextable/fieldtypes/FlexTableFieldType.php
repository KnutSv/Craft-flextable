<?php
namespace Craft;

class FlexTableFieldType extends BaseFieldType
{
    public function getName()
    {
        return Craft::t('Flex table');
    }

    public function defineContentAttribute()
    {
        return array(AttributeType::String, 'column' => ColumnType::Text);
    }

    public function prepValue($value)
    {
        return JsonHelper::decode(JsonHelper::decode($value));
    }

    public function prepValueFromPost($value)
    {

        return JsonHelper::encode($value);
    }

    public function getInputHtml($name, $value)
    {
        // Reformat the input name into something that looks more like an ID
        $id = craft()->templates->formatInputId($name);
        
        // Figure out what that ID is going to look like once it has been namespaced
        $namespacedId = craft()->templates->namespaceInputId($id);

        // Include our Javascript
        craft()->templates->includeCssResource('flextable/css/flextable.css');
        //craft()->templates->includeJsResource('flextable/js/flextable.js');
        craft()->templates->includeJsResource('flextable/js/vue-flextable.js');
        //craft()->templates->includeJs("$('#{$namespacedId}').flextable();");


        // Render the HTML
        return craft()->templates->render('flextable/edit', array(
            'name'  => $name,
            'id'    => $id,
            'value' => JsonHelper::encode($value)
        ));

    }

}