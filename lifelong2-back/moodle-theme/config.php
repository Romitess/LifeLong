<?php
defined('MOODLE_INTERNAL') || die();

$THEME->name = 'lifelong2';
$THEME->parents = ['boost'];
$THEME->enable_boost_scss = true;
// $THEME->prescsscallback = 'theme_lifelong2_get_pre_scss';
// $THEME->extrascsscallback = 'theme_lifelong2_get_extra_scss';
$THEME->rendererfactory = 'theme_overridden_renderer_factory';
$THEME->requiredblocks = '';
$THEME->addblockposition = BLOCK_ADDBLOCK_POSITION_FLATNAV;
$THEME->iconsystem = \core\output\icon_system::FONTAWESOME;
$THEME->javascripts_footer = ['lifelong2-header'];
