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


/**
 * @function getMatrix
 *
 * @description Converts a hex representation of an orientation matrix into a standard matrix
 *
 * @param rotationMatrixIndex
 * @param dataView
 * @return {*}
 ================================================================================================ */
const getMatrix = ( rotationMatrixIndex, dataView ) => {

	let matrix = [],
		offset = 0,
		hasRelevantData;


	// ADD EACH 32 BIT HEX STRING (0xFFFF0000) TO MATRIX
	// ---------------------------------------------------------------------------------------------
	for ( let x = 0; x < 3; x ++ ) {

		let columns = [];

		for ( let y = 0; y < 3; y ++ ) {

			// MATCHES EVERY 4 OR 6 CHARACTERS OF HEX DEPENDING ON WHICH ROW IS BEING PARSED
			let regex = ( ( y + 1 ) % 3 ) ? /.{1,4}/g : /.{1,6}/g,
				hex16, hex32 = numToHex( dataView.getInt32( rotationMatrixIndex + ( offset * 4 ) ) );

			// CONVERT TO USABLE HEX
			hex32 = hex32.split( '' ).reverse().join( '' );

			// PULL OUT IMPORTANT PART OF HEX CODE
			hex16 = hex32.match( regex )[1];

			if ( hex16 ) {

				// REVERSE THE 16BIT HEX STRING
				hex16 = hex16.split( '' ).reverse().join( '' );

				// CONVERT THE HEX EQUIVALENT INTEGER TO RADIANS AND THEN TO DEGREES
				let hexInRadians = Math.asin( 			// CONVERTS AN INTEGER TO RADIANS (eg 1 = 90 deg )
					parseInt( hex16, 16 )		// CONVERTS THE HEX STRING TO A 16 REPRESENTATION OF THAT HEX ( parseInt( 'FF', 16 ) = 255 )
					/
					( 1 << 16 )							// EASY WAY TO GET THE VALUE OF 2 TO THE POWER OF 16 (65536)
				);

				// DEGREES = r * 180 / PI
				columns[ y ] = Math.abs( Math.round( hexInRadians * 180 / Math.PI ) );

				if ( columns[ y ] !== 0 ) hasRelevantData = true;

				// CONVERT THE HEX EQUIVALENT INTEGER TO RADIANS AND THEN TO DEGREES
			} else {

				hex32 = hex32.split( '' ).reverse().join( '' );

				columns[ y ] = Math.abs( Math.round( Math.asin( parseInt( hex32.match( regex, 16 )[0] ) / ( 1 << 16 ) ) * 180 / Math.PI ) );
			}

			offset += 1
		}

		matrix[x] = columns;
	}

	return hasRelevantData ? matrix : false;
};

export { numToHex, stringToHex, hexToAscii, getMatrix }