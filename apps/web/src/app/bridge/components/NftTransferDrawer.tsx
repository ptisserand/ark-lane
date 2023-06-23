import { XMarkIcon } from "@heroicons/react/24/solid";
import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { IconButton, Typography } from "design-system";
import Image from "next/image";
import { useMemo } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import { useIsSSR } from "~/app/hooks/useIsSSR";
import { api } from "~/utils/api";

import {
  CHAIN_LOGOS_BY_NAME,
  CONNECTOR_LABELS_BY_ID,
  type Chain,
  WALLET_LOGOS_BY_ID,
} from "../helpers";
import useNftSelection from "../hooks/useNftSelection";
import TargetChainButton from "./TargetChainButton";

interface ChainTransferSummaryProps {
  chain: Chain;
  connectorId?: string;
  shortAddress: string;
  targetChain: Chain;
}

function ChainTransferSummary({
  chain,
  connectorId,
  shortAddress,
  targetChain,
}: ChainTransferSummaryProps) {
  const isTargetChain = chain === targetChain;
  const isSSR = useIsSSR();

  return (
    <div
      className={`flex justify-between gap-3 rounded-2xl bg-neutral-50 px-3.5 ${
        isTargetChain ? "pb-3 pt-7" : "pb-7 pt-3"
      }`}
    >
      <div className="flex items-center gap-3">
        <Image
          alt={`${chain} logo`}
          height={42}
          src={CHAIN_LOGOS_BY_NAME[chain]}
          width={42}
        />
        <div>
          <span className="rounded-md bg-neutral-200 p-1 text-xs font-semibold">
            {isTargetChain ? "To" : "From"}
          </span>
          <Typography component="div" variant="body_text_14">
            {chain}
          </Typography>
        </div>
      </div>
      {!isSSR && connectorId !== undefined && (
        <div className="flex items-center gap-3">
          <Image
            alt={`${CONNECTOR_LABELS_BY_ID[connectorId] ?? ""} logo`}
            height={42}
            src={WALLET_LOGOS_BY_ID[connectorId] ?? ""}
            width={42}
          />
          <div>
            <span className="rounded-md bg-neutral-200 p-1 text-xs font-semibold">
              Wallet
            </span>
            <Typography component="div" variant="body_text_14">
              {shortAddress}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
}

interface NftTansferDrawerProps {
  targetChain: Chain;
}

export default function NftTransferDrawer({
  targetChain,
}: NftTansferDrawerProps) {
  const { address: ethereumAddress, connector: ethereumConnector } =
    useEthereumAccount();
  const { address: starknetAddress, connector: starknetConnector } =
    useStarknetAccount();

  // TODO @YohanTz: Support both sides
  const { deselectNft, selectedNfts } = useNftSelection("Ethereum");

  // TODO @YohanTz: Hook wrapper around wagmi and starknet-react
  const shortEthereumAddress = useMemo(
    () =>
      ethereumAddress
        ? `${ethereumAddress.slice(0, 6)}...${ethereumAddress.slice(-4)}`
        : "",
    [ethereumAddress]
  );

  const shortStarknetAddress = useMemo(
    () =>
      starknetAddress
        ? `${starknetAddress.slice(0, 6)}...${starknetAddress.slice(-4)}`
        : "",
    [starknetAddress]
  );

  return (
    <div className="mr-3 w-[21.875rem] shrink-0">
      {/* TODO @YohanTz: Extract magic values like this somewhere (top-[5.75rem]) */}
      <div className="fixed bottom-0 right-0 top-[5.75rem] m-3 flex w-[21.875rem] shrink-0 flex-col rounded-2xl border border-neutral-100 bg-white px-5 pb-5 pt-8 dark:border-none dark:bg-dark-blue-900">
        <Typography component="h2" variant="heading_light_xxs">
          Your assets to transfer
        </Typography>
        <Typography className="mt-4" component="p" variant="body_text_14">
          You need to confirm the transaction in your wallet to start the
          migration.
        </Typography>
        <div
          className={`mt-8 flex gap-1.5 ${
            targetChain === "Ethereum" ? "flex-col-reverse" : "flex-col"
          }`}
        >
          <ChainTransferSummary
            chain="Ethereum"
            connectorId={ethereumConnector?.id}
            shortAddress={shortEthereumAddress}
            targetChain={targetChain}
          />
          <TargetChainButton orientation="vertical" />
          <ChainTransferSummary
            chain="Starknet"
            connectorId={starknetConnector?.id()}
            shortAddress={shortStarknetAddress}
            targetChain={targetChain}
          />
        </div>
        {/* TODO @YohanTz: Always show scroll bar to indicate that there is more content to view (with Radix ScrollArea ?) */}
        <div className="mt-8 flex flex-col gap-4 overflow-y-auto">
          {selectedNfts.map((selectedNft) => {
            return (
              <div className="flex justify-between" key={selectedNft?.id}>
                <div className="flex items-center gap-4">
                  <Image
                    alt={selectedNft?.title ?? ""}
                    className="rounded"
                    height={52}
                    src={selectedNft?.image ?? ""}
                    width={52}
                  />
                  <div className="flex flex-col">
                    <Typography variant="body_text_14">
                      {selectedNft?.collectionName}
                    </Typography>
                    <Typography variant="body_text_bold_14">
                      {selectedNft?.title}
                    </Typography>
                  </div>
                </div>
                <IconButton
                  icon={<XMarkIcon className="h-5 w-5 text-primary-300" />}
                  onClick={() => deselectNft(selectedNft?.id ?? "")}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <Typography variant="body_text_14">Total Nfts to migrate</Typography>
          <Typography variant="body_text_14">
            {selectedNfts.length}/{selectedNfts.length}
          </Typography>
        </div>
        <Typography
          className="mt-8 rounded-xl bg-purple-100 p-3"
          component="p"
          variant="body_text_14"
        >
          You must approve the selection of your assets before confirming the
          migration. Each collection will require a signature via your wallet.
        </Typography>
        <button className="mt-8 w-full rounded-full bg-dark-blue-950 p-3 text-sm text-white">
          <Typography variant="body_text_bold_14">
            Approve the selected Nfts
          </Typography>
        </button>
      </div>
    </div>
  );
}