import Atom from './atom.js';

/**
 *
 * @class SampleTable
 *
 * @description The sample table atom contains all the time and data indexing of the media samples
 * in a track. Using tables, it is possible to locate samples in time, determine their type,
 * and determine their size, container, and offset into that container. In short its used to location
 * track media and descriptions of that media. The Sample Atom contains the following structure
 *
 * 	atom size
 * 	atom type 'stbl'
 * 	sample description atom 'stsd'
 * 	time to sample atom 'stts'
 * 	composition offset atom 'ctts'
 * 	composition shift least greatest atom 'cslg'
 * 	sync sample atom 'stss'
 * 	partial sync sample atom 'stps'
 * 	sample to chunk atom 'stsc'
 * 	sample size atom 'stsz'
 * 	chunk offset atom 'stco'
 * 	shadow sync atom 'stsh'
 * 	sample group description atom 'sgpd'
 * 	sample to group atom 'sbgp'
 * 	sample dependency flags atom 'sdtp'
 *
 * 	NOTE: See https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFAppenG/QTFFAppenG.html#//apple_ref/doc/uid/TP40000939-CH2-SW1
 * 	for full descriptions of each atom. Most of this documentation is directly taken from the spec.
 *
 * 	NB - Note that many of the returned values for atoms are still in a byte number format and haven't
 * 	been converted to HEX/Ascii Strings etc. This is mostly because I've not needed these values for anything
 * 	so far.
 *
 *
 ================================================================================================ */
class SampleTable extends Atom {


	/**
	 *
	 * @method sampleDescriptionAtom
	 *
	 * @description Stores information that allows you to decode samples in the media. The data stored
	 * in the sample description varies, depending on the media type. For example, in the case of video
	 * media, the sample descriptions are image description structures. The sample description atom
	 * contains a table of sample descriptions `sampleDescriptionTable`. A media may have one or
	 * more sample descriptions, depending upon the number of different encoding schemes used in the
	 * media and on the number of files used to store the data. The `sampleToChunkAtom` identifies the
	 * sample description for each sample in the media by specifying the index into this table for
	 * the appropriate description.
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
	 * @method timeToSampleAtom
	 *
	 * @description timeToSample atoms store duration information for a media’s samples, providing a
	 * mapping from a time in a media to the corresponding data sample. The atom contains a compact
	 * version of a table that allows indexing from time to sample number. Each entry in the table
	 * gives the number of consecutive samples with the same time delta, and the delta of those samples.
	 * By adding the deltas, a complete time-to-sample map can be built. The atom contains time deltas:
	 * DT(n+1) = DT(n) + STTS(n) where STTS(n) is the (uncompressed) table entry for sample n and DT
	 * is the display time for sample (n). The sample entries are ordered by time stamps; therefore,
	 * the deltas are all nonnegative. The DT axis has a zero origin; DT(i) = SUM (for j=0 to i-1 of
	 * delta(j)), and the sum of all deltas gives the length of the media in the track (not mapped
	 * to the overall time scale, and not considering any edit list). The edit list atom provides
	 * the initial DT value if it is nonempty (nonzero).
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
	 * @method compositionOffsetAtom
	 *
	 * @description Video samples in encoded formats have a decode order and a presentation order
	 * (also called composition order or display order). The composition offset atom is used when
	 * there are out-of-order video samples. If the decode and presentation orders are the same,
	 * no composition offset atom will be present. The time-to-sample atom provides both the decode
	 * and presentation ordering of the video stream, and allows calculation of the start and end times.
	 * If video samples are stored out of presentation order, the time-to-sample atom provides the
	 * decode order and the composition offset atom provides the time of presentation for the decoded
	 * samples expressed as a delta on a sample-by-sample basis. Note: Decode time does not directly
	 * imply presentation time when working with out of order video samples. The ordering is significant.
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
	 * @method compositionShiftLeastGreatestAtom
	 *
	 * @description The optional composition shift least greatest atom summarizes the calculated
	 * minimum and maximum offsets between decode and composition time, as well as the start and
	 * end times, for all samples. This allows a reader to determine the minimum required time for
	 * decode to obtain proper presentation order without needing to scan the sample table for the
	 * range of offsets.
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
	 * @method syncSampleAtom
	 *
	 * @description The sync sample atom identifies the key frames in the media. In a media that contains
	 * compressed data, key frames define starting points for portions of a temporally compressed sequence.
	 * The key frame is self-contained—that is, it is independent of preceding frames. Subsequent frames
	 * may depend on the key frame. The sync sample atom provides a compact marking of the random access
	 * points within a stream. The table is arranged in strictly increasing order of sample number. If
	 * this table is not present, every sample is implicitly a random access point. The sync sample atom
	 * contains a table of sample numbers. Each entry in the table identifies a sample that is a key
	 * frame for the media. If no sync sample atom exists, then all the samples are key frames.
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
	 * @method partialSyncSampleAtom
	 *
	 * @description This atom lists the partial sync samples. Since such samples are not full
	 * sync samples, they should not also be listed in the sync sample atom.
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
	 * @method sampleToChunkAtom
	 *
	 * @description As samples are added to a media, they are collected into chunks that allow optimized
	 * data access. A chunk contains one or more samples. Chunks in a media may have different sizes,
	 * and the samples within a chunk may have different sizes. The sample-to-chunk atom stores
	 * chunk information for the samples in a media. The sample-to-chunk atom contains a table that
	 * maps samples to chunks in the media data stream. By examining the sample-to-chunk atom, you
	 * can determine the chunk that contains a specific sample.
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
	 * @description You use sample size atoms to specify the size of each sample in the media. The
	 * sample size atom contains the sample count and a table giving the size of each sample.
	 * This allows the media data itself to be unframed. The total number of samples in the media
	 * is always indicated in the sample count. If the default size is indicated, then no table follows.
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
	 * @method chunkOffsetAtom
	 *
	 * @description Chunk offset atoms identify the location of each chunk of data in the media’s data stream.
	 * The chunk-offset table gives the index of each chunk into the containing file. There are two
	 * variants, permitting the use of 32-bit or 64-bit offsets. The latter is useful when managing
	 * very large movies. Only one of these variants occurs in any single instance of a sample table
	 * atom. Note that offsets are file offsets, not the offset into any atom within the file (for
	 * example, a 'mdat' atom). This permits referring to media data in files without any atom
	 * structure. However, be careful when constructing a self-contained QuickTime file with its
	 * metadata (movie atom) at the front because the size of the movie atom affects the chunk
	 * offsets to the media data.
	 *
	 * A chunk offset table consists of an array of offset values. There is one table entry for each
	 * chunk in the media. The offset contains the byte offset from the beginning of the data
	 * stream to the chunk. The table is indexed by chunk number, the first table entry corresponds
	 * to the first chunk, the second table entry is for the second chunk, and so on.
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
	 * @description For use in AAC "Audio Priming - Handling Encoder Delay in AAC:" Sample group
	 * description atoms give information about the characteristics of sample groups.
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
	 * @description For use in AAC "Audio Priming - Handling Encoder Delay in AAC:" Sample-to-group
	 * atoms are used to find the group that a sample belongs to and the associated description of
	 * that sample group.
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
	 * @method sampleDependencyFlagAtom
	 *
	 * @description The sample dependency flags atom uses one byte per sample as a bit field that
	 * describes dependency information.
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