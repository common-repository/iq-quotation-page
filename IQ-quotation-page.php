<?php
/*
	Plugin Name: IQ Quotation Page
	Plugin URI: https://www.instant-quote.co/WordPress.aspx
	Description: Loads the Instant-Quote.co quotation page into your WordPress page. Provide a hidden field with id="iqlatlong" to initially center on Latitude & Longitude. Requires your Goolge Maps Key. <strong>[iq_quotationpage hostid="?" filter1="-1" filter2="-1" assettag="-1" assettype="-1" donotpage="false" showtabs="true"]</strong>. Configure under the Settings menu. Now uses Async to load Maps api
	Text Domain: IQquotationpage
	Author: Instant-Quote.co
	Version: 1.3.1
	Author URI: https://www.instant-quote.co
	License: GPLv2 or later
*/

/*
	Copyright 2017 Instant-Quote.co (email : neil@instant-quote.co)
	
	This program is free software; you can redistribute it and/or
	modify it under the terms of the GNU General Public License
	as published by the Free Software Foundation; either version 2
	of the License, or (at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // exit if accessed directly!
}
// TODO: rename this class
class IQ_quoteplugin {
	
	var $path; 				// path to plugin dir
	var $wp_plugin_page; 	// url to plugin page on wp.org
	var $IQ_plugin_page; 	// url to pro plugin page on ns.it
	var $IQ_plugin_name; 	// friendly name of this plugin for re-use throughout
	var $IQ_plugin_slug; 	// slug name of this plugin for re-use throughout
	var $IQ_plugin_ref; 	// reference name of the plugin for re-use throughout
	
	function __construct(){		
		$this->path = plugin_dir_path( __FILE__ );
		// TODO: update to actual
		//$this->wp_plugin_page = "http://wordpress.org/plugins/IQquotationpage";
		// TODO: update to link builder generated URL or other public page or redirect
		$this->IQ_plugin_page = "https://www.instant-quote.co/wordpress.aspx/";
		// TODO: update this - used throughout plugin code and only have to update here
		$this->IQ_plugin_name = "Instant-Quote.co Quotation Page";
		// TODO: update this - used throughout plugin code and only have to update here
		$this->IQ_plugin_slug = "Instant-Quote.co-Quotation-Page";
		// TODO: update this - used throughout plugin code and only have to update here
		$this->IQ_plugin_ref = "IQquotationpage_template";
		
		add_action( 'plugins_loaded', array($this, 'setup_plugin') );
		add_action( 'admin_notices', array($this,'admin_notices'), 11 );
		add_action( 'network_admin_notices', array($this, 'admin_notices'), 11 );		
		add_action( 'admin_init', array($this,'register_settings_fields') );		
		add_action( 'admin_menu', array($this,'register_settings_page'), 20 );
		add_action( 'admin_enqueue_scripts', array($this, 'admin_assets') );
		
		// TODO: uncomment this if you want to add custom JS 
		// add_action( 'admin_print_footer_scripts', array($this, 'add_javascript'), 100 );
		
		// TODO: uncomment this if you want to add custom actions to run on deactivation
		//register_deactivation_hook( __FILE__, array($this, 'deactivate_plugin_actions') );
	}

	function deactivate_plugin_actions(){
		// TODO: add any deactivation actions here
	}
	
	/*********************************
	 * NOTICES & LOCALIZATION
	 */
	 
	 function setup_plugin(){
	 	load_plugin_textdomain( $this->IQ_plugin_slug, false, $this->path."lang/" ); 
	 }
	
	function admin_notices(){

	}	

	function admin_assets($page){
	 	wp_register_style( $this->IQ_plugin_slug, plugins_url("css/IQ-adminpage.css",__FILE__), false, '1.0.0' );
		if( strpos($page, $this->IQ_plugin_ref) !== false  ){
			wp_enqueue_style( $this->IQ_plugin_slug );
		}		
	}
	
	/**********************************
	 * SETTINGS PAGE
	 */
	
	function register_settings_fields() {
		// TODO: might want to update / add additional sections and their names, if so update 'default' in add_settings_field too
		add_settings_section( 
			$this->IQ_plugin_ref.'_set_section', 	// ID used to identify this section and with which to register options
			$this->IQ_plugin_name, 					// Title to be displayed on the administration page
			false, 									// Callback used to render the description of the section
			$this->IQ_plugin_ref 					// Page on which to add this section of options
		);
		// TODO: update labels etc.
		// TODO: for each field or field set repeat this
		add_settings_field( 
			$this->IQ_plugin_ref.'_IQassetstodisplay', 	// ID used to identify the field
			'The number of items to display per page.', 					// The label to the left of the option interface element
			array($this,'show_numbered_textbox_field'), // The name of the function responsible for rendering the option interface
			$this->IQ_plugin_ref, 				// The page on which this option will be displayed
			$this->IQ_plugin_ref.'_set_section',// The name of the section to which this field belongs
			array( 								// args to pass to the callback function rendering the option interface
				'field_name' => $this->IQ_plugin_ref.'_IQassetstodisplay'
			)
		);
add_settings_field( 
			$this->IQ_plugin_ref.'_IQmapskey', 	// ID used to identify the field
			'Your Google Maps Key.', 					// The label to the left of the option interface element
			array($this,'show_mapkey_field'), // The name of the function responsible for rendering the option interface
			$this->IQ_plugin_ref, 				// The page on which this option will be displayed
			$this->IQ_plugin_ref.'_set_section',// The name of the section to which this field belongs
			array( 								// args to pass to the callback function rendering the option interface
				'field_name' => $this->IQ_plugin_ref.'_IQmapskey'
			)
		);
		add_settings_field( 
			$this->IQ_plugin_ref.'_IQcountrycode', 	// ID used to identify the field
			'Your 2 letter country code.', 					// The label to the left of the option interface element
			array($this,'show_countrycodes_field'), // The name of the function responsible for rendering the option interface
			$this->IQ_plugin_ref, 				// The page on which this option will be displayed
			$this->IQ_plugin_ref.'_set_section',// The name of the section to which this field belongs
			array( 								// args to pass to the callback function rendering the option interface
				'field_name' => $this->IQ_plugin_ref.'_IQcountrycode'
			)
		);
		add_settings_field( 
			$this->IQ_plugin_ref.'_IQisdirectory', 	// ID used to identify the field
			'Whether this is a Directory.', 					// The label to the left of the option interface element
			array($this,'show_checkbox_field'), // The name of the function responsible for rendering the option interface
			$this->IQ_plugin_ref, 				// The page on which this option will be displayed
			$this->IQ_plugin_ref.'_set_section',// The name of the section to which this field belongs
			array( 								// args to pass to the callback function rendering the option interface
				'field_name' => $this->IQ_plugin_ref.'_IQisdirectory'
			)
		);

		register_setting( $this->IQ_plugin_ref, $this->IQ_plugin_ref.'_IQcountrycode');
		register_setting( $this->IQ_plugin_ref, $this->IQ_plugin_ref.'_IQmapskey');
		register_setting( $this->IQ_plugin_ref, $this->IQ_plugin_ref.'_IQshowaboutreviews');
		register_setting( $this->IQ_plugin_ref, $this->IQ_plugin_ref.'_IQassetstodisplay');
		register_setting( $this->IQ_plugin_ref, $this->IQ_plugin_ref.'_IQisdirectory');

	}	

	function show_checkbox_field($args){
		$saved_value = get_option($args['field_name']);
		$name = $args['field_name'];
		// initialize in case there are no existing options
		if ( empty($saved_value) ) {
			echo "<input type='checkbox' name='" .$name. "' /><br/>";
		} else {			
			if($saved_value) { $checked = ' checked="checked" '; }
			echo "<input " .$checked. " type='checkbox'  name='" .$name. "' /><br/>";
		}
	}
	function show_numbered_textbox_field($args){
		$saved_value = get_option($args['field_name']);
		$name = $args['field_name'];
		// initialize in case there are no existing options
		if ( empty($saved_value) ) {
 			echo '<input type="number" style="width:40px;" name="' . $args['field_name'] . '" value="" /><br/>';
		} else {
			echo '<input type="number" name="' . $args['field_name'] . '" value="'.$saved_value.'" /><br/>';
		}
	}

	function show_mapkey_field($args){
		$saved_value = get_option($args['field_name']);
		$name = $args['field_name'];
		// initialize in case there are no existing options
		if ( empty($saved_value) ) {
 			echo '<input type="text" name="' . $args['field_name'] . '" value="" /><br/>';
			echo '<p class="description" id="home-description">The system requires a Google Maps key.<br><a target="_blank" style="width:290px;" href="https://developers.google.com/maps/documentation/javascript/get-api-key">Get a free Key</a></p>';
		} else {
			echo '<input type="text" name="' . $args['field_name'] . '" value="'.$saved_value.'" /><br/>';
		}
	}

	function show_countrycodes_field($args){
		$saved_value = get_option( $args['field_name'] );
		$name = $args['field_name'];
		$items = array("GB", "IE", "US", "AU", "NZ", "CA", "IN", "MT", "CY" );
		// initialize in case there are no existing options
		echo "<select name='" .$name. "'>";
		foreach($items as $item) {
			$selected = ($saved_value == $item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select>";
	}

	function register_settings_page(){
		add_submenu_page(
			'options-general.php',								// Parent menu item slug	
			__("IQ Quotation Page"),	// Page Title
			__("IQ Quotation Page"),	// Menu Title
			'manage_options',									// Capability
			$this->IQ_plugin_ref,								// Menu Slug
			array( $this, 'show_settings_page' )				// Callback function
		);
	}
	

	function show_settings_page(){
		?>
		<div class="wrap">
			
			<h2><?php $this->plugin_image( 'IQ_logo.png', __('ALT') ); ?></h2>
			
			<!-- BEGIN Left Column -->
			<div class="ns-col-left">
				<form method="POST" action="options.php" style="width: 100%;">					
					<?php settings_fields($this->IQ_plugin_ref); ?>					
					<?php do_settings_sections($this->IQ_plugin_ref); ?>
					<?php submit_button(); ?>
				</form>
			</div>
			<!-- END Left Column -->
						
			<!-- BEGIN Right Column -->			
			<div class="ns-col-right">				
				<h2>Implementation</h2>
				<p>The Quotation page is a fundamental part of the Instant-Quote.co system.</p>
				<p>It allows you to embed real time availability and the facility for users to get a quote at any time of day into your web site.</p>
				<p>The plugin is implemented by adding a shortcode to your WordPress web page.</p>
				<p>The shortcode takes a single parameter: hostid.</p>
				<p>This can only be a number and can be found as follows:</p>
				<ol>
					<li>Login to the instant-quote.co administration site.</li>
					<li>In the left panel select Configuration.</li>
					<li>Within the Configuration section select Host Configuration.</li>
					<li>Within the Host Configuration section select the host (web site) whose settings you want to use.</li>
					<li>Make a note of the Host id value at the top of the table. That is the value for hostid</li>
				</ol>

				<h3>ShortCode</h3>
				<p>The plugin is called using the shortcode:</p>
				<h4>[iq_quotationpage hostid=&quot;?&quot;]</h4>
				<p>Where the ? is replaced by you with the value you have just looked up.</p>
				<p>Once you have entered your settings on this page, just paste the shortcode into your page and set the hostid value.</p>
				<h4> Restricting the number of items displayed</h4>
<p>You can restrict the number of items displayed at one time in the plugin settings.

Additionally, you can prevent the page from listing further assets by including the field donotpage="true".

For example [iq_quotationpage hostid="?" filter1="11" filter2="13" assettag="0" donotpage="true"]</p>

<h3>Preventing the Asset type buttons from being displayed. </h3> 

<p>If the Separate Tab for Packages is selected in the Quotation Page settings in the Instant Quote dashboard (Configuration \ Quotation Page settings), the quotation page displays each of your Asset Types in a row of tabs. This can be overridden by inserting a hiddenfield into your html:</p>
<p>&lt;input id="hfshowtabs" type=hidden value="false"&gt;</p>

				<h4>Filters</h4>
				<p>Optionally one or two filters can be applied to limit the display as many as  two categories of asset.</p>
				<p>This is achieved by adding further parameters to the shortcode. These parameters are filter1 and filter2</p>
				<p>An example shortcode using filter might be:</p>
				<h4>[iq_quotationpage hostid=&quot;?&quot; filter1=&quot;11&quot; filter2=&quot;13&quot; assettag=&quot;0&quot;]</h4>
<p>If, for example the value of filter1 represented Dogs and the value of filter2 represented Cats, then only dogs and cats would be displayed. The Asset filter IQclassfilter is dependant on the asset type. For a Car it represents private hire, for a bouncy castle it represents children only. the value should be 0 or 1</p>
				<p> A list of the current filters can be found on the Instant-Quote.co WordPress page: <br /> https://www.instant-quote.co/WordPress.aspx</p>
				
				<h2>Configuration</h2>
				<h3>Layout</h3>	

				<p>The Quotation page can be laid out with the input fields above, to the right or to the left of the content. This can be changed by carefully editing the file &quot;IQquotationpage/IQquotationpage.txt&quot; by changing the value of a single css value. This is documented in the file.</p>
				<h3>Settings</h3>
				<p>Use the controls to the left of the page to define which fields are displayed.</p>
				<ol>
					<li>A Google maps key is required for new websites.</li>
					<li>Your 2 letter country code is required to optimise the behaviour of the Maps application.</li>
					<li>If you select that you are a directory, everyone&apos;s assets will be listed on your site.</li>
				</ol>

			</div>
			<!-- END Right Column -->
				
		</div>
		<?php
	}
	
	
	/*************************************
	 * FUNCTIONALITY
	 */
	
	// TODO: add additional necessary functions here

	
	/*************************************
	 * UITILITY
	 */
	 
	 function plugin_image( $filename, $alt='', $class='' ){
	 	echo "<img src='".plugins_url("/images/$filename",__FILE__)."' alt='$alt' class='$class' />";
	 }
	
}
	function get_maps_key($elements, $gmkarray, $dayofweek){
		if ($elements > 0 && $elements <= 7) {
			switch ($elements) {
				case 1:	
					return $gmkarray[0];
				case 2:
					if ( $dayofweek <3) {return $gmkarray[0];};
					if ( $dayofweek >=3) {return $gmkarray[1];};
				case 3:
					if ($dayofweek <2) {return $gmkarray[0];};	
					if ($dayofweek >=2 && $dayofweek <5) {return $gmkarray[1];};	
					if ($dayofweek >=5) {return $gmkarray[2];};	
				case 4:
					if ($dayofweek <2) {return $gmkarray[0];};	
					if ($dayofweek >=2 && $dayofweek <4) {return $gmkarray[1];};	
					if ($dayofweek =4) {return $gmkarray[2];};	
					if ($dayofweek >=5) {return $gmkarray[3];};	
				case 5:
					if ($dayofweek <5) {return $gmkarray[$dayofweek];};	
					if ($dayofweek >=5) {return $gmkarray[1];};	
				case 6:
					if ($dayofweek <6) {return $gmkarray[$dayofweek];};	
					if ($dayofweek >=6) {return $gmkarray[1];};										
				case 7:
					return $gmkarray[$dayofweek];				
			}
		}
		else {return $gmkarray[0];}			
	};	

function iq_quotationpage_shortcode_func($atts) {
 	$a = shortcode_atts( array(
        'hostid' => '0',
		'filter1' => '-1',
		'filter2' => '-1',
		'assettag' => '0',
		'donotpage' => false,
		'showtabs' => true,
		'assettype' => '-1'
    ), $atts );
	
	$delimiter = " ";

	$gmk = trim(get_option('IQquotationpage_template_IQmapskey')); 
	$gmkarray = explode ($delimiter , $gmk);

	$elements = count($gmkarray);

	if ($elements > 1) {
		$gmk = get_maps_key($elements, $gmkarray, date('w'));
	};

 	// See if the page has an asset type defined in page properties
        // Set the iqassettype if it's not -1. Change it to anything else to prevent this 
        
        
        $id = get_the_ID();
	
		$meta = get_post_meta($id, '_iqpageproperties', true);
	
		if(is_array($meta)) {	
			
			if($a['assettype'] == '-1'){
				if(array_key_exists("iqAssetType",$meta)){
					if ($meta["iqAssetType"] !=""){
						$a['assettype'] = $meta["iqAssetType"];
					}
				}
			}			
		}


	
	//	Enqueue the javascript for the plugin
	//	wp_deregister_script( "Instant-Quote.co-Quotation-Page");
        wp_register_script( "Instant-Quote.co-Remote-Quotation-Page", plugins_url("js/directionsdialog.js",__FILE__), array('jquery','jquery-ui-core','jquery-ui-dialog','json2'), null, true );
		wp_enqueue_script( "Instant-Quote.co-Remote-Quotation-Page", array('jquery','jquery-ui-core','jquery-ui-dialog','json2'), null, true );        
		wp_register_script( "Instant-Quote.co-GoogleJSAPI", plugins_url("js/jsapi.js",__FILE__) , null, null, false);
		wp_enqueue_script( "Instant-Quote.co-GoogleJSAPI", null, null, false);
		wp_register_script( "Instant-Quote.co-GoogleWEBFONT", plugins_url("js/webfont.js",__FILE__)  , null, null, false);
		wp_enqueue_script( "Instant-Quote.co-GoogleWEBFONT", null, null, false);
                wp_register_script( "Instant-Quote.co-iqinit",plugins_url("js/iqinit.js",__FILE__) , null, null, false);
		wp_enqueue_script( "Instant-Quote.co-iqinit", null, null, false);
                
		wp_register_script( "Instant-Quote.co-Spinner", plugins_url("js/spin.min.js",__FILE__), null, null, true );
		wp_enqueue_script( "Instant-Quote.co-Spinner", null, null, true );
		wp_register_script( "Instant-Quote.co-prettyphoto", plugins_url("js/jquery.prettyPhoto.js",__FILE__) , array('jquery'), null, true );
		wp_enqueue_script( "Instant-Quote.co-prettyphoto", array('jquery'), null, true );
		wp_register_script( "Instant-Quote.co-zebra-datepicker", plugins_url("js/zebra_datepicker.js",__FILE__) , array('jquery'), null, true );
		wp_enqueue_script( "Instant-Quote.co-zebra-datepicker", array('jquery'), null, true );
			
		wp_register_style( "Instant-Quote.co-Jquery-ui-smoothnessCSS", plugins_url("css/jquery-ui.css",__FILE__), false, null );	
		wp_register_style( "Instant-Quote.co-responsivequotepageCSS", plugins_url("css/responsivequotepage.css",__FILE__), false, null );
		wp_register_style( "Instant-Quote.co-zebradefaultCSS", plugins_url("css/zebradefault.css",__FILE__), false, null );	
		wp_register_style( "Instant-Quote.co-prettyPhotoCSS", plugins_url("css/prettyPhoto.css",__FILE__), false, null );		
		
		wp_enqueue_style(( "Instant-Quote.co-Jquery-ui-smoothnessCSS"),false,null);
		wp_enqueue_style(( "Instant-Quote.co-responsivequotepageCSS"),false,null);
		wp_enqueue_style(( "Instant-Quote.co-zebradefaultCSS"),false,null);	
		wp_enqueue_style(( "Instant-Quote.co-prettyPhotoCSS"),false,null);	

		wp_enqueue_script('jquery-ui-tabs');
		wp_enqueue_script('jquery-ui-dialog');

		
	
		wp_register_script( "Instant-Quote.co-Quotation-Page", plugins_url("js/IQwp_quotationpage.js",__FILE__), array('jquery'), null, true );
		wp_enqueue_script( "Instant-Quote.co-Quotation-Page", array('jquery'), null, true );

		wp_register_style( "Instant-Quote.co-Remote-Quotation-IQuserCSS", plugins_url("css/IQuser.css",__FILE__), false, null );	
		wp_enqueue_style(( "Instant-Quote.co-Remote-Quotation-IQuserCSS"),false,null);	

		wp_register_script( "Instant-Quote.co-GoogleMaps", "https://maps.googleapis.com/maps/api/js?v=3&libraries=geometry,places&amp;region=".get_option('IQquotationpage_template_IQcountrycode')."&loading=async&callback=iqmapinitialise&key=".$gmk."&channel=".$a['hostid']."", null, null, array('strategy'  => 'async',) );
		wp_enqueue_script( "Instant-Quote.co-GoogleMaps", null, null, true );

  	//include the html file
	if (file_exists(plugin_dir_path( __FILE__ ) . 'IQquotepage.txt')){
		ob_start();	
  		include( plugin_dir_path( __FILE__ ) . 'IQquotepage.txt' );
  		//assign the file output to $content variable and clean buffer
  		$content = ob_get_clean();

		If (get_option('IQquotationpage_template_IQisdirectory') == 'on'){
		$content .= "<input id='hfdir' type='hidden' value='{$a['hostid']}' />";
		}		
		if ($a['filter1'] > -1) {
			$content .= "<input id='IQfilter1' type='hidden' value='{$a['filter1']}'/>";
		}
		if ($a['filter2'] > -1) {
			$content .="<input id='IQfilter2' type='hidden' value='{$a['filter2']}' />";
		}
		if ($a['assettag'] > -1) {
			$content .= "<input id='IQclassfilter' type='hidden' value='{$a['assettag']}' />";
		}
		if (intval($a['assettype']) > -1) {
			$content .= "<input id='IQassettype' type='hidden' value='{$a['assettype']}' />";
		}
		
		$content .= "<input id='hfshowtabs' type='hidden' value='{$a['showtabs']}' />";		
		$content .= "<input id='hfdonotpage' type='hidden' value='{$a['donotpage']}' />";			
                $content .= "<input id='hfhost' type='hidden' value='{$a['hostid']}' />";
		$content .= "<input id='hfcount' type='hidden' value='".get_option('IQquotationpage_template_IQassetstodisplay')."' />";

		$content .= "<script>var iqcountrycode = '".get_option('IQquotationpage_template_IQcountrycode')."' </script>";
		
    	return $content ;

		}
		else {
		return "<input id='IQhost' type='hidden' value='{$a['hostid']}' />"; 
			
		}
	}


add_shortcode('iq_quotationpage','iq_quotationpage_shortcode_func'); 

new IQ_quoteplugin();