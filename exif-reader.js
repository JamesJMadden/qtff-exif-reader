'use strict';

import SampleTableAtom from './lib/sample-table.js';
import TrackAtom from './lib/track.js';

// DataView.prototype.setUint24 = function(pos, val) {
// 	this.setUint16( pos, val >> 8 );
// 	this.setUint8(pos + 2, val & 0xff); // this "magic number" masks off the first 16 bits
// };

DataView.prototype.getInt24 = function(pos) {
	return (this.getInt16(pos) << 8) + this.getInt8(pos + 2);
};

// DataView.prototype.setUint24 = function(pos, val) {
// 	this.getInt32( pos, val >> 16 );
// 	this.getInt16(pos + 4, val & 0xffff); // this "magic number" masks off the first 32 bits
// };

DataView.prototype.getInt48 = function(pos) {
	return (this.getInt32(pos) << 16) + this.getInt16(pos + 4);
};


/**
 *
 * @function numToHex
 *
 * @description Helper function to convert an integer to its HEX equivalent
 *
 * @param {Number} number
 * @return {String}
 ================================================================================================ */
window.numToHex = number => {
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
window.stringToHex = string => {

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
window.hexToAscii = str1 => {

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


/**
 * @function getEXIFData
 *
 * @description Extracts the EXIF from a qtff video files headers and returns the orientation matrix.
 * Can be easily altered to return other EXIF data
 *
 * @param buffer
 * @return {Array}
 ================================================================================================ */
const getEXIFData = buffer => {

	const degrees = [],
		tkhdAddresses = SampleTableAtom.findAtomOffset( 'tkhd', buffer ),
		mvhdAddresses = SampleTableAtom.findAtomOffset( 'mvhd', buffer );

	inspectMovieAtom( buffer );

	const dataView = new DataView( buffer );

	mvhdAddresses.forEach( address => {

		// HEADER METADATA
		let type = address - 4,
			atomSize = type - 4,
			version = address + 4,
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
		const parsedMatrix = getMatrix( rotationMatrix, dataView );

		parsedMatrix ? degrees.push( getMatrix( rotationMatrix, dataView ) ) : null;
	} );

	tkhdAddresses.forEach( address => {

		// HEADER METADATA
		let type = address - 4,
			atomSize = type - 4,
			version = address + 4,
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
		let parsedMatrix = getMatrix( rotationMatrix, dataView );

		parsedMatrix ? degrees.push( getMatrix( rotationMatrix, dataView ) ) : null;
	} );

	return degrees
};


/**
 *
 * @function inspectMovieAtom
 *
 * @description
 *
 * @param {ArrayBuffer} buffer
 * @return {Object}
 ================================================================================================ */
const inspectMovieAtom = buffer => {

	const movieAtomAddress = SampleTableAtom.findAtomOffset( 'moov', buffer );


	// ---------------------------------------------------------------------------------------------
	movieAtomAddress.forEach( address => {

		const movieData = SampleTableAtom.getAtomData( address, buffer );

		const trackAddress = SampleTableAtom.findAtomOffset( 'trak', movieData.atom );

		trackAddress.forEach( address => {

			let Track = new TrackAtom( 'trak', movieData.atom, address ),
				handlerReferenceData = Track.handlerReferenceAtom,
				trackType = handlerReferenceData.componentSubType;

			if ( trackType === 'vide' ) {

				const SampleTable = new SampleTableAtom( 'stbl', Track.dataView.buffer );

				const data = {
					chunkOffsetData: SampleTable.chunkOffsetAtom,
					sampleSizeData: SampleTable.sampleChunkSizeAtom,
					sampleToChunkData: SampleTable.sampleToChunkAtom,
					sampleDescriptionData: SampleTable.sampleDescriptionAtom,
					timeToSampleData: SampleTable.timeToSampleAtom,
					compositionOffsetData: SampleTable.compositionOffsetAtom,
					compositionShiftLeastGreatestAtom: SampleTable.compositionShiftLeastGreatestAtom
				};

				const chunkOffsets = data.chunkOffsetData.chunkOffsetTable,
					sampleSizes = data.sampleSizeData.sampleSizeTable,
					chunkSamlpes = data.sampleToChunkData.sampleToChunkTable;

				// GO BACK THROUGH ARRAY OF CHUNK OFFSETS
				chunkOffsets.reverse().forEach( chunkOffset => {

					// FIND SAMPLES FOR CHUNK OFFSET ADDRESS


				} );

				console.log( "CHUNK / SAMPLE DATA FOR: " + trackType, handlerReferenceData );

				console.log( "SampleTable", { data, Track } );
			}
		} );
	} );
};

export { getEXIFData };