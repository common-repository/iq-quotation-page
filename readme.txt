=== Instant-Quote.co Quotation Page===
Contributors: instant-quote.co
Tags: instant-quote, IQ, Quotation page, Quote Page, instant quote, instant-quote.co
Requires at least: 3.5
Tested up to: 6.5.5
Requires PHP: 5.2.4
Stable tag: trunk
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html


== Description ==

Instant-quote.co is a Software as a service solution (SAAS) for small businesses. The system allows consumers to get a quote for a service at any time of the day and displays real time availability of the supplier's resources along with a comprehensive business administration suite.

This plugin for WordPress enables you to embed the Quotation page in your WordPress site.
The fields that are displayed are defined in your Quotation page settings which can be found under Configuration / Quotation Page in the Instant-Quote.co administration interface.

== External resources ==

Wherever possible, files are hosted on your WordPress site. The Exception to this is as follows:
Images of your assets (Cars, Bouncy Castles, Photobooths etc.) are loaded from the Instant-Quote.co site for two reasons.

1	It is quite common to host assets from other providers to increase your exposure though co-operative ventures where each supplier manages their own assets. Their assets appear on your site and vice versa. This is achieved through syndication settings in the Instant-Quote.co administration interface. 
2	Your assets appear on other sites such as directories which are not hosted by you. To maintain consistancy and ease management your resources these are served centrally.

Images are optimised for this purpose to provide a balance of speed and quality.

= Features =
Settings include:

1. Google Maps key configuration.
2. County Code configuration.
3. The type of Instant Quote customer you are - Whether you are a directory or not.
4. The number of items to display per page.

== Installation ==

1. Log in to your WordPress site as an administrator
2. Use the built-in Plugins tools to install from the repository or unzip and Upload the plugin directory to /wp-content/plugins/ 
3. Activate the plugin through the 'Plugins' menu in WordPress
4. The settings for the plugin can be edited by going to by going to Settings > Instant-Quote.co Quotation Page. These settings are used in conjunction with your quotation page settings in the Instant-Quote.co administration interface. 

== Screenshots ==

None

== Frequently Asked Questions ==

= Is this plugin template supported? =
Support is by your normal Instant-quote.co support arrangements  

= How do I find my and Host id? =
You can find these settings in the instant-quote.co administration page.
Under configuration > Host Settings, the Host id is listed at the top of the table.

Alternatively go to Agency > Asset Search.
On each data card the Asset id and Host id is identified.
In this case the host id is the Directory host setting for the Asset.

= How do I use the shortcode? =

The plugin is called using the shortcode:

[iq_quotationpage hostid="?"]

Where the ? is replaced by you with the value you have just looked up.

Once you have entered your settings on this page, just paste the shortcode into your page and set the hostid value.

Filters

Optionally one or two filters can be applied to limit the display to upto to two categories of asset.

This is achieved by adding further parameters to the shortcode. These parameters are filter1 and filter2.

A further tag can also be added which filters the results by a property of the asset. For cars this might be whether it's licensed for private hire. For a bouncy castle it might be that it is only suitable for children. This property of the shortcode is the assettag.

The assettag can have a value of 0 or 1 or be ommitted. 1 enables the filter, 0 or omitting the property passes a value of 0 to the server.

Using these filters allows you to create pages that are specific to certain classes of your products.

An example shortcode using filter might be:

[iq_quotationpage hostid="?" filter1="11" filter2="13" assettag="0"]

A list of the current filters can be found on the Instant-Quote.co WordPress page: 
https://www.instant-quote.co/WordPress.aspx

Restricting the number of items displayed

You can restrict the number of items displayed at one time in the plugin settings.

Additionally, you can prevent the page from listing further assets by including the field donotpage="true".

For example [iq_quotationpage hostid="?" filter1="11" filter2="13" assettag="0" donotpage="true"]

= Preventing the Asset type buttons from being displayed. =

If the Seperate Tab for Packages is selected in the Quotation Page settings in the Instant Quote dashboard (Configuration \ Quotation Page settings), the quotation page displays each of your Asset Types in a row of tabs. This can be overridden by inserting a hiddenfield into your html:
<input id="hfshowtabs" type=hidden value="false">

= How do I change the customer input fields displayed on the page? =

The fields that are displayed on the form are customised in your administration pages on the www.instant-quote.co site.
Log into your account and go to configuration/ Quotation Page.

There are a range of different settings you can change to alter the quotation page.

= How do I change the customer input fields to be displayed to the right? =
Data entry fields can be across the top, to th left or to the right of the displayed assets.
The change in layout requires you to edit a single setting in the file IQquotationpage.txt.

Go to Plugins / Editor in wordPress and select Editor.
Select IQ quotation pages from the drop down list to the top right of the page and select 'Select'
Select IQquotationpage.txt from the right hand side of the page.
This file is the template for the quotation page.

At the top of the page there are instructions on how to make this change to the layout.


== Changelog ==
= 1.3.0 =
*Release Date - 13th July 2024*
*Google Maps in now loaded Asynchronously.*
*Fixed setting the country code so that the Google places search is filtered to the correct country*
*Changing the Event date, Booking duration or Event time all reload availability.*
= 1.0.4 =
*Release Date - 15th April 2022*
*Introduced Services. Assets can now have different services with Guests and duration variables.
= 1.0.3 =
*Release Date - 24th March 2022*
*Introduced refresh of available assets when Start time or Duration changed
= 1.0.2 =
*Release Date - 23rd August, 2021*
*Support for IQ Websites and Page Properties.
= 1.0.1 =
*Release Date - 23rd March, 2018*
* Introduced assettag into the filters.
* Added reset button to clear the form.
* Minor tweaks to css
= 1.0.0 =
* First public release

== Upgrade Notice ==

Backup your IQuser.css files before upgrading, and make a note to any changes you have made to the IQquotepage.txt.

