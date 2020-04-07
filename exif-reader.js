'use strict';


/**
 *
 * @function numToHex
 *
 * @description Helper function to convert an integer to its HEX equivalent
 *
 * @param number
 * @return {string}
 ================================================================================================ */
function numToHex( number ) {
	if ( number < 0 ) number = 0xFFFFFFFF + number + 1;

	return number.toString( 16 ).toUpperCase();
}


/**
 * @function getMatrix
 *
 * @description Converts a hex representation of an orientation matrix into a standard matrix
 *
 * @param rotationMatrixIndex
 * @return {*}
 ================================================================================================ */
function getMatrix( rotationMatrixIndex ) {

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
}


/**
 * @function getEXIFData
 *
 * @description Extracts the EXIF from a qtff video files headers and returns the orientation matrix.
 * Can be easily altered to return other EXIF data
 *
 * @param file
 * @return {Array}
 ================================================================================================ */
function getEXIFData( file ) {
	const degrees = [],
		tkhdAddresses = [],
		mvhdAddresses = [];

	window.dataView = new DataView( file );

	const int32 = new Int32Array( file );

	// FIND THE ADDRESS LOCATION OF tkhd (track atom header) AND mvhd (movie atom header) THERE CAN BE MULTIPLE tkhd IN ONE FILE SO WE'VE TO CHECK EACH ONE
	int32.forEach( ( element, index ) => {

		// 0x746b6864 === tkhd IN HEX
		if ( element === 0x746b6864 ) tkhdAddresses.push( index );

		// 0x6d766864 === mvhd IN HEX
		if ( element === 0x6d766864 ) mvhdAddresses.push( index );
	} );

	mvhdAddresses.forEach( function( address ) {

		// HEADER METADATA
		const version = address + 4,
			flags = version + 1,
			creationTime = flags + 3,
			modificationTime = creationTime + 4,
			timeScale = modificationTime + 4,
			duration = timeScale + 4,
			prefRate = duration + 4,
			prefVolume = prefRate + 4,
			reserved = prefVolume + 2,
			rotationMatrix = reserved + 10;

		// GET THE ROTATION MATRIX BASED IN ITS INDEX IN THE MOVIE HEADER
		const parsedMatrix = getMatrix( rotationMatrix );

		parsedMatrix ? degrees.push( getMatrix( rotationMatrix ) ) : null;
	} );

	tkhdAddresses.forEach( function( address ) {

		// HEADER METADATA
		let version = address + 4,
			flags = version + 1,
			creationTime = flags + 3,
			modificationTime = creationTime + 4,
			trackId = modificationTime + 4,
			reserved1 = trackId + 4,
			duration = reserved1 + 4,
			reserved2 = duration + 4,
			layer = reserved2 + 8,
			altGroup = layer + 2,
			volume = altGroup + 2,
			reserved3 = volume + 2,
			rotationMatrix = reserved3 + 2;

		// GET THE ROTATION MATRIX BASED IN ITS INDEX IN THE TRACK HEADER
		let parsedMatrix = getMatrix( rotationMatrix );

		parsedMatrix ? degrees.push( getMatrix( rotationMatrix ) ) : null;
	} );

	return degrees;
}

export { getEXIFData };