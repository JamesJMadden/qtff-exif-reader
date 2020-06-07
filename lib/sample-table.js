import Atom from './atom.js';


/**
 *
 * @class SampleTable
 *
 ================================================================================================ */
class SampleTable extends Atom {


	/**
	 *
	 * @return {{numberOfEntries: number, sampleToChunkTable: Array, atomSize: number, sampleToChunkTableSize: number, flags: number, type: string, version: *}}
	 ============================================================================================ */
	get sampleToChunkAtom() {

		const address = Atom.findAtomOffset( 'stsc', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "SAMPLE CHUNK TABLES", Atom.findAtomOffset( 'stsc', this.dataView.buffer ) );

		const atomSize = address - 4,
			type = atomSize + 4,
			version = address + 4,
			flags = version + 1,
			numberOfEntries = flags + 3,
			sampleToChunkTable = numberOfEntries + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			sampleToChunkTableSize = endOfAtomAddress - sampleToChunkTable;

		for ( let i = 0; i < sampleToChunkTableSize; i += ( sampleToChunkTableSize / this.dataView.getInt32( numberOfEntries ) ) )
			chunks.push( [
				this.dataView.getInt32( sampleToChunkTable + i ),			// FIRST CHUNK
				this.dataView.getInt32( sampleToChunkTable + 4 + i ),		// SAMPLES PER CHUNK
				this.dataView.getInt32( sampleToChunkTable + 8 + i )		// SAMPLE DESCRIPTION ID
			] );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'stsc',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			numberOfEntries: this.dataView.getInt32( numberOfEntries ),
			sampleToChunkTable: chunks,
			sampleToChunkTableSize
		}
	}


	/**
	 *
	 * @method sampleChunkSizeAtom
	 *
	 * @return {{numberOfEntries: number, atomSize: number, sampleSizeTableSize: number, flags: number, sampleSizeTable: Array, type: string, sampleSize: number, version: *}}
	 ============================================================================================ */
	get sampleChunkSizeAtom() {

		const address = Atom.findAtomOffset( 'stsz', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "SAMPLE SIZE TABLES", Atom.findAtomOffset( 'stsz', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			sampleSize = flags + 3,
			numberOfEntries = sampleSize + 4,
			sampleSizeTable = numberOfEntries + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			sampleSizeTableSize = endOfAtomAddress - sampleSizeTable;

		for ( let i = 0; i < sampleSizeTableSize; i += ( sampleSizeTableSize / this.dataView.getInt32( numberOfEntries ) ) )
			chunks.push( this.dataView.getInt32( sampleSizeTable + i ) );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'stsz',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			sampleSize: this.dataView.getInt32( sampleSize ),
			numberOfEntries: this.dataView.getInt32( numberOfEntries ),
			sampleSizeTable: chunks,
			sampleSizeTableSize
		};
	}


	/**
	 *
	 * @return {{numberOfEntries: number, chunkOffsetTable: Array, atomSize: number, flags: number, type: string, version: *, chunkOffsetTableSize: number}}
	 ============================================================================================ */
	get chunkOffsetAtom() {
		const address = Atom.findAtomOffset( 'stco', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "CHUNK TABLES", Atom.findAtomOffset( 'stco', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			numberOfEntries = flags + 3,
			chunkOffsetTable = numberOfEntries + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			chunkOffsetTableSize = endOfAtomAddress - chunkOffsetTable;

		for ( let i = 0; i < chunkOffsetTableSize; i += ( chunkOffsetTableSize / this.dataView.getInt32( numberOfEntries ) ) )
			chunks.push( this.dataView.getInt32( chunkOffsetTable + i ) );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'stco',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			numberOfEntries: this.dataView.getInt32( numberOfEntries ),
			chunkOffsetTable: chunks,
			chunkOffsetTableSize
		};
	}


	/**
	 *
	 * @return {{numberOfEntries: number, atomSize: number, flags: number, sampleDescriptionTable: Array, sampleDescriptionTableSize: number, type: string, version: *}}
	 */
	get sampleDescriptionAtom() {

		const address = Atom.findAtomOffset( 'stsd', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "SAMPLE DESCRIPTION TABLES", Atom.findAtomOffset( 'stsd', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			numberOfEntries = flags + 3,
			sampleDescriptionTable = numberOfEntries + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			sampleDescriptionTableSize = endOfAtomAddress - sampleDescriptionTable;

		for ( let i = 0; i < sampleDescriptionTableSize; i += ( sampleDescriptionTableSize / this.dataView.getInt32( numberOfEntries ) ) )
			chunks.push( [
				this.dataView.getInt32( sampleDescriptionTable + i ), 									// SAMPLE DESCRIPTION SIZE
				hexToAscii( numToHex( this.dataView.getInt32( sampleDescriptionTable + i + 4 ) ) ), 		// DATA FORMAT
				this.dataView.getInt48( sampleDescriptionTable + i + 4 ), 										// RESERVED 6-bytes ALL SET TO 0
				this.dataView.getInt16( sampleDescriptionTable + i + 6 ) 									// DATA REFERENCE INDEX
			] );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'stsd',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			numberOfEntries: this.dataView.getInt32( numberOfEntries ),
			sampleDescriptionTable: chunks,
			sampleDescriptionTableSize
		};
	}


	/**
	 *
	 * @return {{numberOfEntries: number, atomSize: number, flags: number, timeToSampleTableSize: number, timeToSampleTable: Array, type: string, version: *}}
	 */
	get timeToSampleAtom() {
		const address = Atom.findAtomOffset( 'stts', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "SAMPLE DESCRIPTION TABLES", Atom.findAtomOffset( 'stts', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			numberOfEntries = flags + 3,
			timeToSampleTable = numberOfEntries + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			timeToSampleTableSize = endOfAtomAddress - timeToSampleTable;

		for ( let i = 0; i < timeToSampleTableSize; i += ( timeToSampleTableSize / this.dataView.getInt32( numberOfEntries ) ) )
			chunks.push( [
				this.dataView.getInt32( timeToSampleTable + i ), 			// SAMPLE COUNT
				this.dataView.getInt32( timeToSampleTable + i + 4 ), 		// SAMPLE DURATION
			] );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'stts',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			numberOfEntries: this.dataView.getInt32( numberOfEntries ),
			timeToSampleTable: chunks,
			timeToSampleTableSize
		};
	}

	get compositionOffsetAtom() { return Atom.findAtomOffset( 'ctts', this.dataView.buffer )[ 0 ] }
	get compositionShiftLeastGreatestAtom() { return Atom.findAtomOffset( 'cslg', this.dataView.buffer )[ 0 ] }
	get syncSampleAtom() { return Atom.findAtomOffset( 'stss', this.dataView.buffer )[ 0 ] }
	get partialSyncSampleAtom() { return Atom.findAtomOffset( 'stps', this.dataView.buffer )[ 0 ] }
	get shadowSyncAtom() { return Atom.findAtomOffset( 'stsh', this.dataView.buffer )[ 0 ] }
	get sampleGroupDescriptionAtom() { return Atom.findAtomOffset( 'sgpd', this.dataView.buffer )[ 0 ] }
	get sampleToGroupAtom() { return Atom.findAtomOffset( 'sbgp', this.dataView.buffer )[ 0 ] }
	get sampleDependencyFlagAtom() { return Atom.findAtomOffset( 'sdtp', this.dataView.buffer )[ 0 ] }
}

export default SampleTable;