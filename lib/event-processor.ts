/**
 * Author: Sebastian Schepis
 * Date: 2020-01-21
 * License: Private
 * Description eth event processor
 * No part of this code may be used without explicit permission
 * from the author
 */
import ethers from 'ethers';
import {Contract} from 'ethers';
import config from './config';

// process an event of a contract. installs a realtime event handler
// then scans the blockchain for event up to the present and processes them
// by calling the event handler function.
export default async function processEvents(
  provider: any,
  contract: Contract,
  contractAbi: any,
  eventKind: string,
  eventParams: any,
  eventHandler: any
) {
  const configData: any = config();
  if (!configData.sync) {
    configData.sync = {};
  }

  // calls the user-provided event handler function for each event
  const addToCache = async (event: any) => {
    return await eventHandler(event.event, event.log, contract, contractAbi);
  };

  try {
    // set up the event listener
    await contract.on(eventKind, eventHandler);
    console.log(`installing listener for ${eventKind} ${contract.address}`);
  } catch (e) {
    throw new Error(`Error installing listener for ${eventKind} ${contract.address}: ${e}`);
  }

  // get the last sync block or the system default
  const syncBlockTag =
    eventKind + (contract !== undefined ? '_' + contract.address : '');
  let syncBlock = configData.sync[syncBlockTag];
  if (process.env.RESET_SYNC || isNaN(syncBlock)) {
    syncBlock = undefined;
  }

  // recover if we fail to get a block number
  let curBlock = 0;
  try {
    curBlock = await provider.getBlockNumber();
  } catch (e) {
    throw new Error(`Error getting current block height: ${e}. Cannot proceed.`);
  }

  // error if the expected filter is not in the abi
  if (!contract.filters[eventKind]) {
    throw new Error(`filter not found: ${eventKind}`);
  }

  // set up the event filter we are gonna query - this takes
  // params for the filter expression - null returns all
  const filter: any = contract.filters[eventKind](...eventParams);
  const chunkSize = parseInt(process.env.CHUNKSIZE || '10000');
  const getLaterBlock = (bin: number) => {
    return bin + chunkSize > curBlock ? curBlock : bin + chunkSize;
  };

  // get the starting from block and to blocks
  filter.fromBlock = syncBlock
    ? parseInt(syncBlock)
    : parseInt(process.env.FILTER_FROM || '0');
  filter.toBlock = getLaterBlock(filter.fromBlock);

  const processLoop: any = async () => {
    // contract interface to decode the event

    // get the events from the log
    const events = ((await provider.getLogs(filter)) || [])
      .map((log:any) => ({
        event: new ethers.utils.Interface(contractAbi).decodeEventLog(
          eventKind,
          log.data
        ),
        log,
      }))
      .filter((e:any) => e.event['values']);

    console.log(eventKind, filter.fromBlock, filter.toBlock, events.length);

    let batchArray = [];
    // add each of the items to the cache
    for (let j = 0; j < events.length; j++) {
      batchArray.push(addToCache(events[j]));
      if (batchArray.length >= parseInt(process.env.BATCHSIZE || '100')) {
        await Promise.all(batchArray);
        batchArray = [];
      }
    }
    if (batchArray.length > 0) {
      await Promise.all(batchArray);
    }
    filter.fromBlock = filter.toBlock; // the block to start indexing from.
    //  This should be the block the contract was deployed at.
    filter.toBlock = getLaterBlock(filter.fromBlock);

    // store the block height we scanned to
    configData.sync[syncBlockTag] = filter.fromBlock;
    configData.save();

    if (filter.fromBlock < curBlock) {
      // we have more to do
      return await processLoop();
    }
  };
  await processLoop();
}
