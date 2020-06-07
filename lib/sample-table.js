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
	 * @method sampleSizeAtom
	 *
	 * @return {{numberOfEntries: number, atomSize: number, sampleSizeTableSize: number, flags: number, sampleSizeTable: Array, type: string, sampleSize: number, version: *}}
	 ============================================================================================ */
	get sampleSizeAtom() {

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

		console.log( "TIME TO SAMPLE TABLES", Atom.findAtomOffset( 'stts', this.dataView.buffer ) );

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


	/**
	 *
	 * @return {{numberOfEntries: number, atomSize: number, flags: number, type: string, compositionOffsetTableSize: number, version: *, compositionOffsetTable: Array}}
	 */
	get compositionOffsetAtom() {
		const address = Atom.findAtomOffset( 'ctts', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "COMPOSITION OFFSET TABLES", Atom.findAtomOffset( 'ctts', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			entryCount = flags + 3,
			compositionOffsetTable = entryCount + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			compositionOffsetTableSize = endOfAtomAddress - compositionOffsetTable;

		for ( let i = 0; i < compositionOffsetTableSize; i += ( compositionOffsetTableSize / this.dataView.getInt32( entryCount ) ) )
			chunks.push( [
				this.dataView.getInt32( compositionOffsetTable + i ), 			// SAMPLE COUNT
				this.dataView.getInt32( compositionOffsetTable + i + 4 ), 		// COMPOSITION OFFSET
			] );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'ctts',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			numberOfEntries: this.dataView.getInt32( entryCount ),
			compositionOffsetTable: chunks,
			compositionOffsetTableSize
		};
	}


	/**
	 *
	 * @return {{leastDisplayOffset: number, atomSize: number, greatestDisplayOffset: number, flags: number, displayStartTime: number, displayEndTime: number, type: string, version: *, compositionOffsetToDisplayOffsetShift: number}}
	 */
	get compositionShiftLeastGreatestAtom() {
		const address = Atom.findAtomOffset( 'cslg', this.dataView.buffer )[ 0 ];

		console.log( "COMPOSITION SHIFT LEAST/GREATEST ATOM", Atom.findAtomOffset( 'cslg', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			compositionOffsetToDisplayOffsetShift = flags + 3,
			leastDisplayOffset = compositionOffsetToDisplayOffsetShift + 4,
			greatestDisplayOffset = leastDisplayOffset + 4,
			displayStartTime = greatestDisplayOffset + 4,
			displayEndTime = displayStartTime + 4;

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'cslg',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			compositionOffsetToDisplayOffsetShift: this.dataView.getInt32( compositionOffsetToDisplayOffsetShift ),
			leastDisplayOffset: this.dataView.getInt32( leastDisplayOffset ),
			greatestDisplayOffset: this.dataView.getInt32( greatestDisplayOffset ),
			displayStartTime: this.dataView.getInt32( displayStartTime ),
			displayEndTime: this.dataView.getInt32( displayEndTime )
		};
	}


	/**
	 *
	 * @return {{numberOfEntries: number, atomSize: number, syncSampleTable: Array, flags: number, syncSampleTableSize: number, type: string, version: *}}
	 */
	get syncSampleAtom() {

		const address = Atom.findAtomOffset( 'stss', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "SYNC SAMPLE ATOM", Atom.findAtomOffset( 'stss', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			numberOfEntries = flags + 3,
			syncSampleTable = numberOfEntries + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			syncSampleTableSize = endOfAtomAddress - syncSampleTable;

		for ( let i = 0; i < syncSampleTableSize; i += ( syncSampleTableSize / this.dataView.getInt32( numberOfEntries ) ) )
			chunks.push( [
				this.dataView.getInt32( syncSampleTable + i ), 			// KEY FRAME
			] );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'stss',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			numberOfEntries: this.dataView.getInt32( numberOfEntries ),
			syncSampleTable: chunks,
			syncSampleTableSize
		};
	}


	/**
	 *
	 * @return {{numberOfEntries: number, partialSyncSampleTableSize: number, atomSize: number, flags: number, type: string, version: *, compositionOffsetTable: Array}}
	 */
	get partialSyncSampleAtom() {
		const address = Atom.findAtomOffset( 'stps', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "PARTIAL SYNC SAMPLE ATOM", Atom.findAtomOffset( 'stps', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			entryCount = flags + 3,
			partialSyncSampleTable = entryCount + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			partialSyncSampleTableSize = endOfAtomAddress - partialSyncSampleTable;

		for ( let i = 0; i < partialSyncSampleTableSize; i += ( partialSyncSampleTableSize / this.dataView.getInt32( entryCount ) ) )
			chunks.push( [
				this.dataView.getInt32( partialSyncSampleTable + i ), 			// SAMPLE COUNT
			] );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'stps',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			numberOfEntries: this.dataView.getInt32( entryCount ),
			compositionOffsetTable: chunks,
			partialSyncSampleTableSize
		};
	}


	/**
	 *
	 * @description Reserved for future use as described in the QuickTime documentation:
	 * https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25691
	 *
	 * @return {*}
	 */
	get shadowSyncAtom() {
		return Atom.findAtomOffset( 'stsh', this.dataView.buffer )[ 0 ];
	}


	/**
	 *
	 * @description Audio Priming - Handling Encoder Delay in AAC:
	 *
	 * @return {{entryCount: number, atomSize: number, defaultLength: number, groupingType: number, flags: number, type: string, payloadData: number, version: *}|*}
	 */
	get sampleGroupDescriptionAtom() {
		const address = Atom.findAtomOffset( 'sgpd', this.dataView.buffer )[ 0 ];

		console.log( "SAMPLE GROUP DESCRIPTION ATOM", Atom.findAtomOffset( 'sgpd', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			groupingType = flags + 3,
			defaultLength = groupingType + 4,
			entryCount = defaultLength + 4,
			payloadData = entryCount + 4;

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'sgpd',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			groupingType: this.dataView.getInt32( groupingType ),
			defaultLength: this.dataView.getInt32( defaultLength ),
			entryCount: this.dataView.getInt32( entryCount ),
			payloadData: this.dataView.getInt16( payloadData )
		};
	}


	/**
	 *
	 * @description Audio Priming - Handling Encoder Delay in AAC:
	 *
	 * @return {{numberOfEntries: number, atomSize: number, groupingType: number, flags: number, tableData: Array, tableDataSize: number, type: string, version: *}}
	 */
	get sampleToGroupAtom() {
		const address = Atom.findAtomOffset( 'sbgp', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "SAMPLE TO GROUP ATOM", Atom.findAtomOffset( 'sbgp', this.dataView.buffer ) );

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			groupingType = flags + 3,
			entryCount = groupingType + 4,
			tableData = entryCount + 4,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			tableDataSize = endOfAtomAddress - tableData;

		for ( let i = 0; i < tableDataSize; i += ( tableDataSize / this.dataView.getInt32( entryCount ) ) )
			chunks.push( [
				this.dataView.getInt32( tableData + i ), 				// SAMPLE COUNT
				this.dataView.getInt32( tableData + i + 4 ), 			// GROUP DESCRIPTION INDEX
			] );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'sbgp',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			groupingType: this.dataView.getInt32( groupingType ),
			numberOfEntries: this.dataView.getInt32( entryCount ),
			tableData: chunks,
			tableDataSize
		};
	}


	/**
	 *
	 * @return {{numberOfEntries: number, atomSize: number, sampleDependencyFlagsTable: Array, flags: number, tableDataSize: *, type: string, version: *}}
	 */
	get sampleDependencyFlagAtom() {
		const address = Atom.findAtomOffset( 'sdtp', this.dataView.buffer )[ 0 ],
			chunks = [];

		console.log( "SAMPLE DEPENDENCY ATOM", Atom.findAtomOffset( 'sdtp', this.dataView.buffer ) );

		const sampleSizeAtom = this.sampleSizeAtom;

		const type = address,
			atomSize = type - 4,
			version = address + 4,
			flags = version + 1,
			sampleDependencyFlagsTable = flags + 3,
			endOfAtomAddress = ( address - 4 ) + this.dataView.getInt32( atomSize ),
			numberOfEntries = sampleSizeAtom.numberOfEntries,
			sampleDependencyFlagsTableSize = endOfAtomAddress - sampleDependencyFlagsTable;

		for ( let i = 0; i < sampleDependencyFlagsTableSize; i += ( sampleDependencyFlagsTableSize / numberOfEntries ) )
			chunks.push( [
				this.dataView.getInt8( sampleDependencyFlagsTable + i ), 				// SAMPLE COUNT
			] );

		return {
			atomSize: this.dataView.getInt32( atomSize ),
			type: 'sdtp',
			version: this.dataView.getInt24( version ),
			flags: this.dataView.getInt16( flags ),
			numberOfEntries: numberOfEntries,
			sampleDependencyFlagsTable: chunks,
			sampleDependencyFlagsTableSize
		};
	}
}

export default SampleTable;