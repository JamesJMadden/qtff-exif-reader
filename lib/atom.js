'use strict';

import { numToHex, stringToHex, hexToAscii } from './utils.js';


/**
 * @class Atom
 */
class Atom {


	/**
	 *
	 * @param atomType
	 * @param buffer
	 * @param address
	 ============================================================================================ */
	constructor( atomType, buffer, address ) {

		this.dataView = new DataView( address ? Atom.getAtomData( address, buffer ).atom : buffer );

		this.address = Atom.findAtomOffset( atomType, this.dataView )[ 0 ];

		this.atomSize = this.dataView.getInt32( this.address - 4 );
	}


	/**
	 *
	 * @method getAtomData
	 *
	 * @description Reads basic data stored in an atom
	 *
	 * @param address
	 * @param buffer
	 * @return {{atomSize: number, type: String, atom: ArrayBuffer}}
	 ============================================================================================ */
	static getAtomData( address, buffer ) {

		const dataView = buffer ? new DataView( buffer ) : this.dataView,
			type = address,
			atomSize = type - 4;

		return {
			type: hexToAscii( numToHex( dataView.getInt32( type ) ) ),
			atomSize: dataView.getInt32( atomSize ),
			atom: dataView.buffer.slice( atomSize, atomSize + dataView.getInt32( atomSize ) )
		}
	}


	/**
	 *
	 * @method findAtomOffset
	 *
	 * @description finds the offset of an atom string from a buffer
	 *
	 * @param atomType
	 * @param buffer
	 * @return {Array}
	 ============================================================================================ */
	static findAtomOffset( atomType, buffer ) {

		const matchedIndexes = [],
			int8 = new Int8Array( buffer );

		atomType = stringToHex( atomType );

		// CONVERT ATOM TYPE INTO ARRAY OF HEX PAIRS TO COMPARE AGAINST
		atomType = [ ...atomType ].reduce( ( acc, val, idx ) =>
			idx % 2 === 0
				? ( acc ? `${acc},${val}` : `${val}` )
				: `${acc}${val}`, ''
		).split( ',' );

		// FIND THE ADDRESS OF PASSED ATOM TYPE
		int8.forEach(  ( element, index ) => {

			if ( ( int8[ index ] === parseInt( atomType[ 0 ], 16 ) ) &&
				( int8[ index + 1 ] === parseInt( atomType[ 1 ], 16 ) ) &&
				( int8[ index + 2 ] === parseInt( atomType[ 2 ], 16 ) ) &&
				( int8[ index + 3 ] === parseInt( atomType[ 3 ], 16 ) ) )
				matchedIndexes.push( index );
		} );

		return matchedIndexes || [];
	}
}

export default Atom;