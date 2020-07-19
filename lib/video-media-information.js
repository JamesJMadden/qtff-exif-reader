'use strict';

import Atom from './atom.js';
import { numToHex, hexToAscii, getMatrix } from './utils.js';


/**
 *
 * @class SampleTable
 *
 ================================================================================================ */
class VideoMediaInfo extends Atom {


	get videoMediaInformationAtom() {
		const address = Atom.findAtomOffset( 'load', this.dataView.buffer )[ 0 ];
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

	get dataInformationAtom() {
		const address = Atom.findAtomOffset( 'mdia', this.dataView.buffer )[ 0 ];
	}

	get sampleTableAtom() {
		const address = Atom.findAtomOffset( 'udta', this.dataView.buffer )[ 0 ];
	}
}

export default VideoMediaInfo;