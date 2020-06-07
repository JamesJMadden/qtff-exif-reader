'use strict';

/**
 *
 * @function numToHex
 *
 * @description Helper function to convert an integer to its HEX equivalent
 *
 * @param {Number} number
 * @return {String}
 ================================================================================================ */
const numToHex = number => {
	if ( number < 0 ) number = 0xFFFFFFFF + number + 1;

	return number.toString( 16 ).toUpperCase();
};


/**
 *
 * @function stringToHex
 *
 * @description Helper function to convert a string to its HEX equivalent
 *
 * @param {String} string
 * @return {String}
 ================================================================================================ */
const stringToHex = string => {

	return [ ...string ].map( ( a ) => a.charCodeAt( 0 ).toString( 16 ) ).join( '' );
};


/**
 *
 * @function hexToAscii
 *
 * @description Helper function to convert a hex to ASCII characters
 *
 * @param {String} str1
 * @return {String}
 ================================================================================================ */
const hexToAscii = str1 => {

	if ( str1 === '0' ) return null;

	const hex  = str1.toString();

	let str = '';

	for ( let n = 0; n < hex.length; n += 2 )
		str += String.fromCharCode( parseInt( hex.substr( n, 2 ), 16 ) );

	return str;
};

export { numToHex, stringToHex, hexToAscii }