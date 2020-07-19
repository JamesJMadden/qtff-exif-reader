'use strict';

import Atom from './atom.js';
import { numToHex, hexToAscii, getMatrix } from './utils.js';


/**
 *
 * @class SampleTable
 *
 ================================================================================================ */
class Movie extends Atom {


	get movieHeaderAtom() {
		const address = Atom.findAtomOffset( 'mvhd', this.dataView.buffer )[ 0 ];

		const atomType = address,
			atomSize = atomType - 4,
			version = address + 4,
			flags = version + 1,
			creationTime = flags + 3,
			modificationTime = creationTime + 4,
			timeScale = modificationTime + 4,
			duration = timeScale + 4,
			preferredRate = duration + 4,
			preferredVolume = preferredRate + 4,
			reserved = preferredVolume + 2,
			matrixStructure = reserved + 10,
			previewTime = matrixStructure + 36,
			previewDuration = previewTime + 4,
			posterTime = previewDuration + 4,
			selectionTime = posterTime + 4,
			selectionDuration = selectionTime + 4,
			currentTime = selectionDuration + 4,
			nextTrackID = currentTime + 4;

		return {
			atomType: 'mvhd',
			atomSize: this.dataView.getInt32( atomSize ),
			version: this.dataView.getInt8( version ),
			flags: this.dataView.getInt24( flags ),
			creationTime: this.dataView.getInt32( creationTime ),
			modificationTime: this.dataView.getInt32( modificationTime ),
			timeScale: this.dataView.getInt32( timeScale ),
			duration: this.dataView.getInt32( duration ),
			preferredRate: this.dataView.getInt32( preferredRate ),
			preferredVolume: this.dataView.getInt16( preferredVolume ),

			reserved,
			matrixStructure: getMatrix( matrixStructure, this.dataView ),

			previewTime: this.dataView.getInt32( previewTime ),
			previewDuration: this.dataView.getInt32( previewDuration ),
			posterTime: this.dataView.getInt32( posterTime ),
			selectionTime: this.dataView.getInt32( selectionTime ),
			selectionDuration: this.dataView.getInt32( selectionDuration ),
			currentTime: this.dataView.getInt32( creationTime ),
			nextTrackID: this.dataView.getInt32( nextTrackID )
		};
	}


	get clippingAtom() {
		const address = Atom.findAtomOffset( 'clip', this.dataView.buffer )[ 0 ];

		const atomType = address,
			atomSize = atomType - 4,
			clippinRegionAtom = this.clippingRegionAtom;

		return {
			atomType: 'mvhd',
			atomSize: this.dataView.getInt32( atomSize ),
			clippinRegionAtom
		};
	}

	get clippingRegionAtom() {
		const address = Atom.findAtomOffset( 'crgn', this.dataView.buffer )[ 0 ],
			data = [];

		const atomType = address,
			atomSize = atomType - 4,
			regionSize = atomSize + 4,
			regionBoundryBox = regionSize + 2,
			clippingRegionData = regionBoundryBox + 8,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			clippingRegionDataSize = endOfAtomAddress - clippingRegionData;

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			atomType: 'crgn',
			regionSize: this.dataView.getInt8( regionSize ),
			regionBoundryBox: this.dataView.getBigInt64( regionBoundryBox ),
			// TODO: NOT ABLE TO POPULATE clippingRegionData TABLE AS SPEC DOESN'T OUTLINE THE STRUCTURE
			// TODO: NOR IS THERE A numberOfEntries FIELD TYPICALLY SEEN WITH THESE TYPES OF TABLES
			// TODO: UNLESS regionSize IS THE INDICATOR USED
			clippingRegionData, endOfAtomAddress, data, clippingRegionDataSize
		};
	}

	get trackAtom() {

		// TODO: IMPLEMENT GETTER FOR TRACK ATOMS IN MOVIE ATOM
		const TrackAtoms = [];

		return TrackAtoms
	}

	get userDataAtom() {
		const address = Atom.findAtomOffset( 'udta', this.dataView.buffer )[ 0 ];

		const atomType = address,
			atomSize = atomType - 4;

		const userDataListAtomTypes = [ '©arg', '©ark', '©cok', '©com', '©cpy', '©day', '©dir',
			'©ed1', '©ed2', '©ed3', '©ed4', '©ed5', '©ed6', '©ed7', '©ed8', '©ed9', '©fmt', '©inf',
			'©isr', '©lab', '©lal', '©mak', '©mal', '©nak', '©nam', '©pdk', '©phg', '©prd', '©prf',
			'©prk', '©prl', '©req', '©snk', '©snm', '©src', '©swf', '©swk', '©swr', '©wrt', 'AllF',
			'hinf', 'hnti', 'name', 'tnam', 'tagc', 'LOOP', 'ptv ', 'SelO', 'WLOC' ];

		let currentAddress = 0,
			terminatingZero = 0x00;

		userDataListAtomTypes.forEach( element => {

			const elementAddress = Atom.findAtomOffset( element, this.dataView.buffer )[ 0 ],
				elementAtomType = elementAddress,
				elementAtomSize = elementAtomType - 4;

			currentAddress += elementAtomSize;

			// TODO: NEED TO SEARCH FOR TERMINATING 0 TO FIND END OF user item data (ie. 32bit Int SET TO 0)
		} );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			atomType: 'udta'
		};
	}

	get colorTableAtom() {
		const address = Atom.findAtomOffset( 'ctab', this.dataView.buffer )[ 0 ];
	}

	get compressedMovieAtom() {
		const address = Atom.findAtomOffset( 'cmov', this.dataView.buffer )[ 0 ];
	}

	get referenceMovieAtom() {
		const address = Atom.findAtomOffset( 'rmra', this.dataView.buffer )[ 0 ];
	}
}

export default Movie;