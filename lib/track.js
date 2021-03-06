'use strict';

import Atom from './atom.js';
import { numToHex, hexToAscii, getMatrix } from './utils.js';


/**
 *
 * @class SampleTable
 *
 ================================================================================================ */
class Track extends Atom {


	/**
	 *
	 * @method trackHeaderAtom
	 *
	 * @return {{trackHeight: number, atomSize: number, creationTime: number, trackId: number, flags: number, rotationMatrix: *, type: string, version: *, layer: number, duration: number, volume: number, altGroup: number, modificationTime: number, trackWidth: number, reserved3: number, reserved2: bigint, reserved1: number}}
	 */
	get trackHeaderAtom() {

		const address = Atom.findAtomOffset( 'tkhd', this.dataView.buffer )[ 0 ];

		const type = address,  							// 32-bit Int
			atomSize = type - 4,						// 32-bit Int
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
			rotationMatrix = reserved3 + 2,
			trackWidth = rotationMatrix + 36,
			trackHeight = trackWidth + 4;

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'tkhd',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			creationTime: this.dataView.getUint32( creationTime ),
			modificationTime: this.dataView.getUint32( modificationTime ),
			trackId: this.dataView.getUint32( trackId ),
			reserved1: this.dataView.getUint32( reserved1 ),
			duration: this.dataView.getUint32( duration ),
			reserved2: this.dataView.getBigUint64( reserved2 ),
			layer: this.dataView.getUint16( layer ),
			altGroup: this.dataView.getUint16( altGroup ),
			volume: this.dataView.getUint16( volume ),
			reserved3: this.dataView.getUint16( reserved3 ),
			rotationMatrix: getMatrix( rotationMatrix, this.dataView ),
			trackWidth: this.dataView.getUint32( trackWidth ),
			trackHeight: this.dataView.getUint32( trackHeight )
		};
	}


	get trackAperatureModeDimensionsAtom() {
		const address = Atom.findAtomOffset( 'tapt', this.dataView.buffer )[ 0 ];
	}

	get clippingAtom() {
		const address = Atom.findAtomOffset( 'clip', this.dataView.buffer )[ 0 ];

		const type = address,
			atomSize = type - 4,
			clippinRegionAtom = this.clippingRegionAtom;

		return {
			type: 'mvhd',
			atomSize: this.dataView.getInt32( atomSize ),
			clippinRegionAtom
		};
	}

	get clippingRegionAtom() {
		const address = Atom.findAtomOffset( 'crgn', this.dataView.buffer )[ 0 ],
			data = [];

		const type = address,
			atomSize = type - 4,
			regionSize = atomSize + 4,
			regionBoundryBox = regionSize + 2,
			clippingRegionData = regionBoundryBox + 8,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			clippingRegionDataSize = endOfAtomAddress - clippingRegionData;

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'crgn',
			regionSize: this.dataView.getInt8( regionSize ),
			regionBoundryBox: this.dataView.getBigInt64( regionBoundryBox ),
			// TODO: NOT ABLE TO POPULATE clippingRegionData TABLE AS SPEC DOESN'T OUTLINE THE STRUCTURE
			// TODO: NOR IS THERE A numberOfEntries FIELD TYPICALLY SEEN WITH THESE TYPES OF TABLES
			// TODO: UNLESS regionSize IS THE INDICATOR USED
			clippingRegionData, endOfAtomAddress, data, clippingRegionDataSize
		};
	}

	get trackMatteAtom() {
		const address = Atom.findAtomOffset( 'matt', this.dataView.buffer )[ 0 ];

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			matteImageDescriptionStructure = flags + 3,
			matteData = [];

		return {
			type: 'mvhd',
			atomSize: this.dataView.getInt32( atomSize ),
			version: this.dataView.getInt8( version ),
			flags: this.dataView.getInt24( flags ),

			// TODO: USE videoSampleDescription TO DETERMINE THESE FIELDS
			matteImageDescriptionStructure,
			matteData
		};
	}

	get editAtom() {
		const address = Atom.findAtomOffset( 'edts', this.dataView.buffer )[ 0 ];
	}

	get trackReferenceAtom() {
		const address = Atom.findAtomOffset( 'tref', this.dataView.buffer )[ 0 ];
	}

	get trackExcludeFromAutoselectionAtom() {
		const address = Atom.findAtomOffset( 'txas', this.dataView.buffer )[ 0 ];
	}

	get trackLoadingSettingsAtom() {
		const address = Atom.findAtomOffset( 'load', this.dataView.buffer )[ 0 ];
	}

	get trackInputMapAtom() {
		const address = Atom.findAtomOffset( 'imap', this.dataView.buffer )[ 0 ];
	}

	get mediaAtom() {
		const address = Atom.findAtomOffset( 'mdia', this.dataView.buffer )[ 0 ];
	}

	get userDataAtom() {
		const address = Atom.findAtomOffset( 'udta', this.dataView.buffer )[ 0 ];
	}

	/**
	 *
	 * @method handlerReferenceAtom
	 *
	 * @description Reads data specific to a Handler Reference (hdlr) atom
	 *
	 * @return {{componentType: String, componentManufacturer: String, componentFlags: String, atomSize: number, componentFlagsMask: String, componentSubType: String, flags: number, componenetName: String, type: string, version: *}}
	 */
	get handlerReferenceAtom() {

		const address = Atom.findAtomOffset( 'hdlr', this.dataView.buffer )[ 0 ];

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			componentType = flags + 3,
			componentSubType = componentType + 4,
			componentManufacturer = componentSubType + 4,
			componentFlags = componentManufacturer + 4,
			componentFlagsMask = componentFlags + 4,
			componentName = componentFlagsMask + 4;

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'hdlr',
			version: this.dataView.getInt8( version ),
			flags: this.dataView.getInt24( flags ),
			componentType: hexToAscii( numToHex( this.dataView.getInt32( componentType ) ) ),
			componentSubType: hexToAscii( numToHex( this.dataView.getInt32( componentSubType ) ) ),
			componentManufacturer: numToHex( this.dataView.getInt32( componentManufacturer ) ),
			componentFlags: numToHex( this.dataView.getInt32( componentFlags ) ),
			componentFlagsMask: numToHex( this.dataView.getInt32( componentFlagsMask ) ),
			componentName: hexToAscii( numToHex( this.dataView.getInt32( componentName ) ) )
		}
	}
}

export default Track;