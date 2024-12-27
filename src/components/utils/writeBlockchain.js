import {
    getContract,
    prepareContractCall
} from "thirdweb";

import { useSendTransaction } from "thirdweb/react";

import { defineChain } from "thirdweb/chains";
import client from "./client"


const contract = getContract({
    client,
    chain: defineChain(2442),
    address: "0x2ba60f23fD69886ad5d38396e9699f8495bF8424",
});


const writeContract = async () => {
    const { mutate: sendTransaction } = useSendTransaction();

    const transaction = prepareContractCall({
        contract,
        method:
            "function approve(address to, uint256 tokenId)",
        params: [to, tokenId],
    });
    sendTransaction(transaction);
};


export default function Component() {
    const { mutate: sendTransaction } = useSendTransaction();

    const onClick = () => {
        const transaction = prepareContractCall({
            contract,
            method:
                "function approve(address to, uint256 tokenId)",
            params: [to, tokenId],
        });
        sendTransaction(transaction);
    };
}