'use strict';

import SampleTableAtom from './lib/sample-table.js';
import TrackAtom from './lib/track.js';
import { getMatrix } from './lib/utils.js';

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

	console.log( "AOWDINAD degrees ", degrees );

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

			const trackHeaderAtom = Track.trackHeaderAtom;

			console.log( "AWDOINAWD", trackHeaderAtom );

			if ( trackType === 'vide' ) {

				const SampleTable = new SampleTableAtom( 'stbl', Track.dataView.buffer );

				const data = {
					chunkOffsetData: SampleTable.chunkOffsetAtom,
					sampleSizeData: SampleTable.sampleSizeAtom,
					sampleToChunkData: SampleTable.sampleToChunkAtom,
					sampleDescriptionData: SampleTable.sampleDescriptionAtom,
					timeToSampleData: SampleTable.timeToSampleAtom,
					compositionOffsetData: SampleTable.compositionOffsetAtom,
					compositionShiftLeastGreatestAtom: SampleTable.compositionShiftLeastGreatestAtom,
					syncSampleAtom: SampleTable.syncSampleAtom,
					partialSyncSampleAtom: SampleTable.partialSyncSampleAtom,
					shadowSyncAtom: SampleTable.shadowSyncAtom,
					sampleGroupDescriptionAtom: SampleTable.sampleGroupDescriptionAtom,
					sampleToGroupAtom: SampleTable.sampleToGroupAtom,
					sampleDependencyFlagAtom: SampleTable.sampleDependencyFlagAtom
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