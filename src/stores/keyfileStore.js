import { writable, derived } from "svelte/store";
import Arweave from "arweave";

// We store the arweave keyfile here.
// It gets saved to the local stroage of the browser
// It never leaves the user's browser

export const keyfile = createCustomStore("keyfile");
export const address = createCustomStore("address");
// export const client = createArweaveClientStore();

// this is a custom store
// it enables saving to local storage
function createCustomStore (storeName) {
  const { subscribe, set } = writable("");

  if(process.browser && (localStorage.getItem(storeName) !== null && localStorage.getItem(storeName) !== "" && localStorage.getItem(storeName) !== "null" && localStorage.getItem(storeName) !== undefined)) { // is logged in according to the browser
    set(localStorage.getItem(storeName))
  }

  return {
    subscribe,
    reset: () => { // reset / log out
      set("");
      localStorage.removeItem(storeName);
    },
    set: (val) => { // set
      set(val);
      localStorage.setItem(storeName, val);
    }
  }
}

// return the balance
export const balance = derived(
  address,
  ($address, set) => {
    if(!process.browser) return;
    const 
      client = new Arweave({
        host: "arweave.dev",
        port: 443,
        protocol: "https",
        timeout: 20000,
      }),
      getBalance = () => client.wallets.getBalance($address).then(_balance => set(client.ar.winstonToAr(_balance)));
    getBalance();
    // refresh in every minute
    setInterval(getBalance, 60000);
  },
  0
);

// a derived store
// acts like a computed variable in Vue
// returns if the user is logged in
export const loggedIn = derived(
  keyfile,
  $keyfile => ($keyfile !== "" && $keyfile !== "null" && $keyfile !== null && $keyfile !== undefined)
);

// log out
// this removes the keyfile from local stroage 
export function logOut () {
  keyfile.reset();
}

/*

// the client store
// used to connect to arweave
function createArweaveClientStore () {
  const { subscribe, set } = writable({});
  if(process.browser) {
    set(new Arweave({
      host: "arweave.dev",
      port: 443,
      protocol: "https",
      timeout: 20000,
    }));
  }
  return { set, subscribe };
}

export async function logIn (keyfile) {
  if(!process.browser) return;
  let address, balance;
  await $client.wallets.jwkToAddress(JSON.parse(keyfile)).then(_address => address = _address);
  await $client.wallets.getBalance(address).then(_balance => balance = $client.ar.winstonToAr(_balance));
  console.log(address, balance);
}*/