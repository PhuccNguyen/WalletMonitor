import { Telegraf } from 'telegraf';
import axios from 'axios';
import dotenv from 'dotenv';
import WebSocket from 'ws';

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let priceHistory = [];
const WHALE_WALLETS = [
  "bc1qazcm763858nkj2dj986etajv6wquslv8uxwczt",
  "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo",
  "bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97",
  "bc1ql49ydapnjafl5t2cp9zqpjwe6pdgmxy98859v2",
  "3M219KR5vEneNb47ewrPfWyb5jQ2DjxRP6",
  "bc1qjasf9z3h7w3jspkhtgatgpyvvzgpa2wwd2lr0eh5tx44reyn2k7sfc27a4",
  "1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF",
  "bc1q8yj0herd4r4yxszw3nkfvt53433thk0f5qst4g",
  "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6",
  "3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb",
  "1Ay8vMC7R1UbyCCZRVULMV7iQpHSAbguJP",
  "bc1qcv8h9hp5w8c4qpze0a4tdxw6qjtvg8yps23k0g3aymxx7jlesv4q4t6f65",
  "bc1qd4ysezhmypwty5dnw7c8nqy5h5nxg0xqsvaefd0qn5kq32vwnwqqgv4rzr",
  "1LdRcdxfbSnmCYYNdeYpUnztiYzVfBEQeC",
  "1AC4fMwgY8j9onSbXEWeH6Zan8QGMSdmtA",
  "3PXBET2GrTwCamkeDzKCx8DeGDyrbuGKoc",
  "1LruNZjwamWJXThX2Y8C2d47QqhAkkc5os",
  "bc1qa2eu6p5rl9255e3xz7fcgm6snn4wl5kdfh7zpt05qp5fad9dmsys0qjg0e",
  "bc1qxu4nfkdf8a97mey8ke3npg3aggvskvvcdgndnvxn5upv7jypxdgs3mhvvy",
  "bc1q4j7fcl8zx5yl56j00nkqez9zf3f6ggqchwzzcs5hjxwqhsgxvavq3qfgpr",
  "3MgEAFWu1HKSnZ5ZsC8qf61ZW18xrP5pgd",
  "3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a",
  "bc1q7ydrtdn8z62xhslqyqtyt38mm4e2c4h3mxjkug",
  "bc1qk4m9zv5tnxf2pddd565wugsjrkqkfn90aa0wypj2530f4f7tjwrqntpens",
  "bc1q8taf2eca7pn9wu4czt8fgftqm288xtfxdyt33syzxuexxty733xsszghzk",
  "bc1qzwhw94uldd3c8736lsxrda6t6x56030f8zk8nr",
  "12XqeqZRVkBDgmPLVY4ZC6Y4ruUUEug8Fx",
  "bc1qx9t2l3pyny2spqpqlye8svce70nppwtaxwdrp4",
  "3FHNBLobJnbCTFTVakh5TXmEneyf5PT61B",
  "12ib7dApVFvg82TXKycWBNpN8kFyiAN1dr",
  "12tkqA9xSoowkzoERHMWNKsTey55YEBqkv",
  "3EMVdMehEq5SFipQ5UFbsfMsH223sSz9A9",
  "bc1q7uq3u829ahn22sdlpac0h0lurq3a9yfd3ew69f",
  "39eYrpgAgDhp4tTjrSb1ppZ5kdAc1ikBYw",
  "17MWdxfjPYP2PYhdy885QtihfbW181r1rn",
  "38UmuUqPCrFmQo4khkomQwZ4VbY2nZMJ67",
  "1N7jWmv63mkMdsYzbNUVHbEYDQfcq1u8Yp",
  "19D5J8c59P2bAkWKvxSYw8WWnMzw7PwYheZ",
  "15cHRgVrGKz7qp2JL2N5mkB2MCFGLcnHxv",
  "3JZq4atUahhuA9rLhXLMhhTo133J9rF97j",
  "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h",
  "bc1qr4dl5wa7kl8yu792dceg9z5knl2gkn220lk7a9",
  "3HfD4pvF43jdu9dzVMEr1b8AnDHooRGc5t",
  "17rm2dvb439dZqyMe2d4D6AQJSgg6yeNRn",
  "1PeizMg76Cf96nUQrYg8xuoZWLQozU5zGW",
  "bc1qk7fy6qumtdkjy765ujxqxe0my55ake0zefa2dmt6sjx2sr098d8qf26ufn",
  "bc1qx2x5cqhymfcnjtg902ky6u5t5htmt7fvqztdsm028hkrvxcl4t2sjtpd9l",
  "bc1qlt5nm3kflne7rht4alsnzdzad878ld5rcu4na0",
  "3FuhQLprN9s9MR3bZzR5da7mw75fuahsaU",
  "33Z2C8wLHsVJxoPudpBDHQ9yz4nHCgVseQ",
  "34HpHYiyQwg69gFmCq2BGHjF1DZnZnBeBP",
  "bc1q6qphr80zug3v37xf503a7atzfn3au2fz0dy9ek",
  "bc1q32lyrhp9zpww22phqjwwmelta0c8a5q990ghs6",
  "1GR9qNz7zgtaW5HwwVpEJWMnGWhsbsieCG",
  "bc1qchctnvmdva5z9vrpxkkxck64v7nmzdtyxsrq64",
  "1CNtkWbb4grh8xtb8mhoZ6armNE9PHgzA8",
  "bc1q72nyp6mzxjxm02j7t85pg0pq24684zdj2wuweu",
  "1PJiGp2yDLvUgqeBsuZVCBADArNsk6XEiw",
  "bc1p3nmr2yzmgaml07lx7n3ehe8a2uvu2nrqfrqx8leqt562t4dnm8tsqxmpyt",
  "32retgqZViwtgbaJJYDMMVop9J55G3w6cC",
  "bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa",
  "3FM9vDYsN2iuMPKWjAcqgyahdwdrUxhbJ3",
  "3D6kjgsypiAnGY7E1XHDQXapW4whUWaH1H",
  "bc1qkmk4v2xn29yge68LiuZVupa6WTSuPfF",
  "bc1qcpflj68s3ahy4xajez4d8v3vk28pvf7qte2jmlftvxzfke2u6mqsge3gvh",
  "1Mo1nW5ZM5m2tx9qMsYm2YJxGn3TeS9gR9",
  "39gUvGynQ7Re3i15G3J2gp9DEB9LnLFPMN",
  "1F34duy2eeMz5mSrvFepVzy7Y1rBsnAyWC",
  "bc1q7t9fxfaakmtk8pj7tdxjvwsng6y9x76czuaf5h",
  "bc1qxlth5har0qasqvattsjvgp80st2x402u5shuud",
  "1Pzaqw98PeRfyHypfqyEgg5yycJRsENrE7",
  "1Q8QR5k32hexiMQnRgkJ6fmmjn5fMWhdv9",
  "bc1qhk0ghcywv0mlmcmz37avmnahp2c7rszkeu6f9fx6shxg4plew8as825qm77x6e",
  "1f1miYFQWTzdLiCBxtHHnNiW7WAWPUccr",
  "bc1qsxdxm0exqdsmnl9ejrz250xqxrxpxkgf5nhhtq",
  "1BAFWQhH9pNkz3mZDQ1tWrtKkSHVCkc3fV",
  "14YK4mzJGo5NKkNnmVJeuEAQftLt795Gec",
  "1Ki3WTEEqTLPNsN5cGTsMkL2sJ4m5mdCXT",
  "1KbrSKrT3GeEruTuuYYUSQ35JwKbrAWJYm",
  "1P1iThxBH542Gmk1kZNXyji4E4iwpvSbrt",
  "12tLs9c9RsALt4ockxa1hB4iTCTSmxj2me",
  "1ucXXZQSEf4zny2HRwAQKtVpkLPTUKRtt",
  "1DzsfLRDfbmQM99xm59au2SrTY3YmciBSB",
  "1CPaziTqeEixPoSFtJxu74uDGbpEAotZom",
  "1GUfWdZQoo2pQ4BKHsiegxuZPnheY5ueTm",
  "12HnxiXEeKUVjQRbMVTytsGWnzHd5LdGCt",
  "17uULjz9moeLyjXHoKNwDRgKzf8ahY3Jia",
  "18qNs1yBGGKR8RyErnEF5kegbNUgPfixhS",
  "1DP3VYwN6ozHXDDaETbvNFLd86CAXfaewi",
  "1MewpRkpcbFjqamPPYc1bXa9AJ189Succy",
  "1MtUMTqtdrpT6Rar5fgWoyrzAevatssej5",
  "1NhJGUJu8rrTwPS4vopsdTqqcK4nAwdLwJ",
  "1H2MXWiSniAgg7MqQhyEynRn9htstEELZDn",
  "1DcT5Wij5tfb3oVViF8mA8p4WrG98ahZPT",
  "1JQULE6yHr9UaitLr4wahTwJN7DaMX7W1Z",
  "1CY7fykRLWXeSbKB885Kr4KjQxmDdvW923",
  "bc1q8vwsnzvy4fudzx9lyktpgu3pza34yqrdfnemc2",
  "bc1qxkhwkn623l5lg4rx9vx8cujmleaga0eg6wc7p6",
  "39DUz1NCkLu25GczWiAjjgZBu4mJkbDNA",
  "bc1qvpgyac88vqtslewxu7yu9dqwp8rd83zch55zpm3xgn3mgg72w3kqv0s8qa",
  "3GPAWK5aUB5Ve9akvTzZgp69USjgbhFbay",
  "bc1qd46j77pkp5vdxraf8tw5l6xs36dlygdx2rt9ly",
  "1P9fAFAsSLRmMu2P7wZ5CXDPRfLSWTy9N8",
  "33eU1zeB2S4x3p4ccSsnAChXcGJgtMrMtZ",
  "1HLvaTs3zR3oev9ya7Pzp3GB9Gqfg6XYJT",
  "bc1qukqenm2t85dhdta9glqehllglxznsu4qyxn079",
  "bc1qffyax9rrxmqyq8xwjkzrrqwqjp3ppz5a4665f9",
  "167ZWTT8n6s4ya8cGjqNNQjDwDGY31vmHg",
  "39wVd42giU95ca39sEPkbPTpWygvsBDuA5",
  "3FupZp77ySr7jwoLYEJ9mwzJpvoNBXsBnE",
  "143gLvWYUojXaWZRrxquRKpVNTkhmr415B",
  "3CybbwzZmteP8gSwk5c7r8jirMziPVGkqw",
  "3NWndKFmvV6cJ6ENgXVeaDTo3mBfAvr27H",
  "187zSqAYwMKJAxWdWQ4fmp5DyT6G2NPgD7",
  "bc1q5xm6ph5z8vryeqz8xq068wetcxkj97zajk8nn5",
  "3JfjvpikkxqfhW862ve1Ec6wZNkKcE8nLL",
  "1Cr7EjvS8C7gfarREHCvFhd9gT3r46pfLb",
  "1MwQyJLNerHPVMTQXKAbQrnwMNAXYHRH3",
  "1GcPTDtNXuPghJU5qSGvkPQ99nhWrbQaYR",
  "1GaSQcWg3R98qf5sTWetwjjMh6ehxj25Gp",
  "1LjUYdf8mQk9DsrVvuPYeHyJKQq5V1MLsT",
  "1MH8s3qc4F2GZNod1R43qeysSB2ssZCXb",
  "12T7nyMrAnd13UAMYCCJZ8Fw7PpMGPRFsi",
  "13AiVabLoTcYTdaFcFYtpFFmCFagjiUwE2",
  "1GBzbXJtgFZrLfzEXvh6cD4VhtHHSHhMea",
  "18zuLTKQnLjp987LdxuYvjekYnNAvXif2b",
  "3PWn1AGqo8HWH8mXSsxx1Ytk87zMAAziFU",
  "198aMn6ZYAczwrE5NvNTUMyJ5qkfy4g3Hi",
  "18f6y4uWnLd7VPzfR2c1dMboihghXYHRH3",
  "17wADqWPK8wZfpRmPkauviq2VDBmhm82rM",
  "1EUgoa25tkqMUYh7PXzDfqqNP5PtHKZmct",
  "1AfHER73jneZAEAHNiz5dBKnrzeWcMJM5i",
  "1NJdqNoC7uPh7MqQhyEynRn9htstEELZDn",
  "15TbabdR3FKJMpRxDeEetezWKGJwdGXbTY",
  "1LuEe5Xkf1eA493SvsKwjPTS9RkW9JV9N2",
  "1Ja7G9JJRw8WWnLd7VPzfR2c1dMboihghXYHRH3",
  "1CptxmzfRyU2rF3VJ6q8wa2tkh3cm82p9P",
  "1PnsNtAqmHQKxyqKS843J9aegdJsXr5rpD",
  "1AXskHt4ZwVZLonZV8BMDxh4V65ec41KMJ",
  "1JnfbQerGjFHVq28945y1bhoUHpn6vKM9v",
  "15Z5YJaaNSxeynvr6uW6jQZLwq3n1Hu6RX",
  "3PdJMuuCu6w3aZK6gT4J43n2djWUbxTWcH",
  "1B4U28Yc1JmSQbpzzSfavEskTPMvBRphyD",
  "14vbdGfYS7UKMvc4334UZDvTMPFA2G7zCB",
  "1K8QG4fuswaWFZ2fmmuxVKaWibi9H95iGw",
  "18h3ed4gr53maxrckPZjfFD5Rvy8cSJAjh",
  "1JKDzFHcb6KBybKSquvMw1FrxXhvBdMiB5",
  "1DwSAnZw4Gk9FotgWZhRb3Nzqi4PLdU8M",
  "1JECFWTZsRw65y65DEVR2djXv2KMYfuo7A",
  "1Mt6STNGoHGuDziUSCagqTGNGrbDFSBxRn",
  "1361wC48gW19mKAJmAkdXScLZKYdXgViS9",
  "1M14kQL3zfyEAHx6JCM3gsZyAxyiSDMWdp",
  "bc1qk2q9ptkvfrtt3769hh85zvq88jyrulk6zgys2h",
  "3JzJtHrWgKswmsWB4owpvXFw47bU2d1GQc",
  "1BdXs6VndkN2Kr4D5YAiDmuWuEk3V2qC4c",
  "bc1qvf35autwy0knhh3sj7suupmw3w94r4r9c2ry5z",
  "34ovCavdkQgEYbrJk9Q1onhK7uWqq6J7DC",
  "19tiUa9nsPTgaqWNHaM9QyCfv4Wm9dVeYa",
  "1FZcb6BU1ZbHQJcby7vDF2zXPY2zXPYXk",
  "19RtRzXV5px91eMbWZFCWLZRUeQX5XxxnJ",
  "1C1sUtw6fYa1Yr5wexrH2ayT1ZykD9Sobx",
  "1JFUG5K3HidvfJD4R7nKyDJikmFpPcBB2",
  "bc1qzkqmyv57jpuntyc9ydjyrq4hlneevrmr0xe9kz",
  "bc1qefquzwru2k8f4m2guh2rs388l9q73qecf0dejm",
  "13eEt6myAo1zAC7o7RK5sVxxCNCAgd6ApH",
  "1DzjE3ANaKLasY2n6e5ToJ4CQCXrvDvwsf",
  "324rP14bzX8kW1JWt1J8ohZjDFyt2G68Kq",
  "1FJuzzQFVMbiMGw6JtcXefdD64amy7mSCF",
  "186XqVoL7TGxR3osoo4xn32wbYtb527raY",
  "36NkTqCAApfRJBKicQaqrdKs29g6hyE4LS",
  "3DVJfEsDTPkGDvqPCLC2k2k2DLZjBoYYnMNAXYdhx",
  "1Ac2JdpQ5c9NeSajdGx6dofxeXkn4S35ft",
  "1pChUJ9WQhWtqyt5RtSnLarZYRaJEnwjNt",
  "bc1qatjx2qc8vxz39m0qdz303z8et2pgmc74xz8km3",
  "3Nu84pbqfcfaFztQ74qc9ni2PH5HGM1bzS",
  "bc1qjh0akslml59uuczddqu0y4p3vj64hg5mc94c40",
  "bc1qrd7t2sl5rdfke32qcryyep6r78vyq703mvggq7",
  "1AYLzYN7SGu5FQLBTADBzqKm4b6Udt6Bw6",
  "1NpZcfBnaJeoRT9ZqwZVRMw3SRs546VsuE",
  "bc1ql7c3k2xw90qmhpntte94mu7mpra6g77nqtj6v7",
  "bc1qrxhrm90p6qccryymrugwknt42je5kv0wd7c50tdhx70fa6yclv8sz6uvd3",
  "18SN8PV997oDGtYmTPPD55GDaPtNNEGWeu",
  "18QCiLiXhko8pb4rqv3mCtC834tSTWHNij",
  "147sPaNaqeyQp8GS2oAUajhb9d4PZ9xAv9",
  "bc1qzxwdcxqj36ane625hkgjpg6p0pjg79u29qyrus",
  "1PjPfocmxS262puhYqUwaagE9zBJTZHGwK",
  "1NSbFq6rCeSC1p2EBrov5R1uUTFRBu8tcs",
  "18gYq8BpkbcizC4jZ9zyQxo2NBVEQ2p4hM",
  "16b8LpbDa38xrAQHVVDrC3xyztPdRaX5a2",
  "1HmiKJMQH4569UMpeGX2QStUfpjx7pBKhW",
  "1NFPNeet3ygvVZtDbxYeLECfs7g7vH8PSV",
  "14Ngt4akcnVgaoAMxoMqz9rPcP3bYsGbbM",
  "1MJZLeLbsoSf2kuDr5gAX3QE93BvhvqkCC",
  "3DR2iGGQCUhShGhjTqShLAYEqxzAfY8pvZ",
  "1JCozFUFS5TBAAbnrr9jRWDVQURo2kGeRq",
  "1DFv3qVAbravZBZqHmoEphMDtTs2zXPYXk",
  "19CkUw43czT8yQctnHXNiB5ivNtibWbzqS",
  "1JxmKkNK1b3p7r8DDPtnNmGeLZDcgPadJb",
  "37TTwX8uGwjWApXL8GbwU9p7vHoAupCFcw",
  "bc1qg2ayc8hnw8k98q66vw3qjyx55tj7tg2rqcslna",
  "19oLGXykNUBj8f7w1tT9emuaEbaSFj1p27",
  "1JtAupan5MSPXxSsWFiwA79bY9LD2Ga1je",
  "1LBBmkr9muf7RjjBbzQQvzNQpRRaVEnavs",
  "bc1qfflzlmk8mj97mht8w9aq7w6lwc34xwww2hthy2",
  "bc1qtrxc0use4hlm7fl0j6t37z7qlwl5eppj8lywz6",
  "32ixEdVJWo3kmvJGMTZq5jAQVZZeuwnqzo",
  "16rF2zwSJ9goQ9fZfYoti5LsUqqegb5RnA",
  "3QCgxyh9t1XgZD6jQYgmyXQDzBPxWLsH2p",
  "1AkJq3KKGpKQDVRzVYR6SxdzToM47nopdV",
  "1LVYbnSX6f6vE2Zn4zs2oZ4eKyBgzkqaay",
  "1J3B2ucUpWjWPPpejUCoLN93Gwz3q65CTd",
  "1FY6RL8Ju9b6CGsHTK68yYEcnzUasufyCe",
  "1MbNM3jwxMjRzeA9xyHbMyePN68MY4Jxb",
  "178E8tYZ5WJ6PpADdpmmZd67Se7uPhJCLX",
  "1BsdDaJtgFZrLfzEXvh6cD4VhtHHSHhMea",
  "1Lj2mCPJYbbC2X6oYwV6sXnE8CZ4heK5UD",
  "1Kr6QSydW9bFQG1mXiPNNu6WpJGmUa9i1g",
  "1HvZQX9XkFFaNa8d5VpwMcYkyebyp6cCXM",
  "1FvkWMMH9MDMACHqynrerzduaQ5AjjZKDA",
  "19dNe9Xg6JWvszgU3NuM6TNd2wHmANPbHB",
  "138EMxwMtKuvCEUtm4qUfT2x344TSReyiT",
  "1D3mERfHYY2e96HKUZUsXX7HqHkqUFEadv",
  "14UeyAD9rQCSJgdJzuzFgShq84gW62Bsat",
  "1DDWbJhKqfidczaHF1ugGP2KzPgcaU3tGD",
  "3L41yRzWATBFS3TSHGxFAJiTxahB94MpcQ",
  "1NBX1UZE3EFPTnYNkDfVhRADvVc8v6pRYu",
  "13n67sFKgqLDKp8gx8Xvm6scdfY4ZeaU8p",
  "1KN4cw6kczLshsFdsPJNP538eLu6j8UVQg",
  "1EF3T11bL7yua2yJo4waaQ3RgewNwRnKMw",
  "bc1q8urxlm2uye3t6nwg0y44sn32p0ynvefxpqseu4",
  "bc1q0lfp0nn9z9r370rhmp27xsmf3khwtranuegp9k",
  "15SGg7PpcJ7bMhENw4gc3Qp4LT6c5uLGza",
  "1Cw9Kyr8hKsucXTtcwuGVqeBHDrnRtXC8D",
  "1DR93bfKVCUJkDvPuxbUAEtzYRaJEnwjNt",
  "1AwimXdGoX8nR9dMagCDMGJQB62GNHgrqM",
  "1FUpBduq45UfULPACj1Phw9hRvwroJqYUX",
  "1GuLYGgr9FZwCBBQfDmMiJfTF4cvyrJSeu",
  "152BK6BQa672Dy8PHf4JQtS27pBRBiYy6e",
  "1Ly9nQEyaRQoRPSAE4dABrpav2SaAR383W",
  "154sxXJekWHQ5nPxkkaWnMghy4o9qWaNdU",
  "1Gc6ggvqHRRwyyx6rrW9Wn17bqzV7voWvD",
  "1CCqLR8YrUMPFgYZWwLW8FkezbFjfeXD8n",
  "1D387jd5ZuvudpUQrSv8vK5b2M1SBnvdY8",
  "bc1q4mcyastjs4k9gfzrsua4l8mxy393d53a6nnd4r",
  "3M3EtJGx5Dy9nCATLDhyRCrKGc38QC9z2e",
  "18DowXoMUQT5EU8zPTDTrq4hrwmi8ddCcc",
  "bc1quv866t7ke929gxttpgc2u30ffnczpgfrjugwxv",
  "31vGTThPybgTLC2k2DLZjBoYYnMNAXYdhx",
  "bc1qf6vc30jjmgkrayazenc8kxdatqg28jd0qhcvwc",
  "3HroDXv8hmzKRtaSfBffRgedKpru8fgy6M",
  "1KNm4K8GUK8sMoxc2Z3zU8Uv5FDVjrA72p",
  "bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90",
  "bc1qc45h5yduv0cp8w6jv6rafs0g2say65rnn268jt3vlk6x3hg9u7kqvh3xk7",
  "bc1qlrf750tfxsm8j5uu484lfywam3ffjrvmcvyr3a",
  "1BVtDi7txPCG2TH5Crd2Rw5MtpivbmoKgB",
  "bc1qtmhy4putlcmlm32y42s0xq8m6z3clx9yse2g0r",
  "bc1qq4h5pmydtvw8rsxttmxd8rxkx0rl420fq83y34",
  "394BAk5Vae7B7AdzpzVx43Zx4uVBpAqRk7",
  "3LLkjCcLEC5N2RSBk5r4jwnwBZ69xY2PXq",
  "bc1qjav0ce3rc5n6espfjndrxck4s44sv66nagccsfqgu7yvwh539nlq6myyad",
  "bc1qv007mjtgmyvyqlwyv5nqk54gr8ekteknhur6fr",
  "162bzZT2hJfv5Gm3ZmWfWfHJjCtMD6rHhw",
  "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC",
  "12d1e4x5oprNf7au7BrTryx5D5mGCrXLY5",
  "34iPiWYZyn3d99WgiSzF5UPsir7ix3j4Xe",
  "1ARWCREnmdKyHgNg2c9qih8UzRr4MMQEQS",
  "1DaCQDfStUgkPQXcf53Teeo6LPiKcVMBM9",
  "16Jka2DrvEGGJ6ks2kXRpxmQZLQmAFRoGk",
  "19z6WynrjHeD5MMv6919BuQRwybuen1sRv",
  "1NQEV6T4avmPqUVTvgsKkeB6yc8qnSWfhR",
  "1NJQZhzYac89fDhQCmb1khdjekKNVYLFMY",
  "12ytiN9oWQTRGb6JjZiaoWMAvF9nPWdGX1",
  "1LnoZawVFFQihU8d8ntxLMpYheZUfyeVAK",
  "bc1q2we5eqjj8je6lz9xwjattpc3pn4jejc5h0s70f",
  "bc1qeth6n6ryxexvkx34wnx3nuynun4474h3j0gkhw",
  "bc1ps4xh9n9688jjlczas846kq64mxnhp8e5aradpcpuj852dvhmpzkqs57a3g",
  "bc1qpp3v9k4g5hqjfztextp5nn9808lcru9j8m4n2p",
  "12GQSEPmoCiw7zrWJbsYa5SD3hkKPSzyAq",
  "14f3x5v48f7b7QN6Lqt56Fg8jBQ7nVn26N",
  "bc1qu0gedsrw3axk37avmnahp2c7rszkeu6f9fx6shxg4plew8as825qm77x6e",
  "1Cm9ugUjEUyMvjB3uWxESapa861uEtcVyc",
  "1ZK5rrghS3Uhnra64LiuZVupa6WTSuPfF",
  "15n6GcFRFm3287FotAWunZe58D9yXx13AB",
  "1G6KK2j1C7DAsPmQ6joZpAY4gN84z5Te4E",
  "1CY3uBdj9ZypiiZUymr2kVSaByFdEbYrcU",
  "1Ms4LPLVYWCyYTAqBcotXAeizHgE778abE",
  "1PPWcRj9k2oRr2uEJUQpmTo293a68tkjTX",
  "1Btud1pqADgGzgBCZzxzc2b1o1ytk1HYWC",
  "1BXZng4dcXDnYNRXRgHqWjzT5RwxHHBSHo",
  "1GrwDkr33gT6LuumniYjKEGjTLhsL5kmqC",
  "1BvNwfxEQwZNRmYQ3eno6e976XyxhCsRXj",
  "bc1qrjq4tavyrxsg9p50aqmyj60lwx5eg73q5vr7ey",
  "1Mq54q43p6iCssCStAQt1gQubPciUfboL2",
  "1PPuNHJanckd7a1ddTM8Dpv4TqGF3ZqggK",
  "1PmtxPwpw4s4VBy45HfFwLfKvj3YDbG43w",
  "124ixYbTUb5jBAsY5X9pJfimdc3x1qJSPu",
  "1DFs6ynVroL3Kd86dW8sqWVf6u3W65mqYN",
  "17spLhCpZVdQXFz2ZL1aP5gRci6RFVNhrD",
  "3J8HWyAAsa5g8uTod4CNDHCBEs7hesVtQF",
  "1Miy5sJZSamDZN6xcJJidp9zYxhSrpDeJm",
]
// 🚀 **Fetch Real-Time Bitcoin Price**
async function getBitcoinPrice() {
    try {
        const response = await axios.get(process.env.COINGECKO_API);
        return response.data.bitcoin.usd;
    } catch (error) {
        console.error("Error fetching BTC price, switching to fallback API...");
        try {
            const fallback = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
            return parseFloat(fallback.data.price);
        } catch (err) {
            console.error("Fallback API failed:", err);
            return "N/A";
        }
    }
}

// 📡 **Track BTC Price in Real-Time**
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

ws.on('open', () => {
    console.log("✅ Connected to Binance WebSocket");
});

ws.on('message', async (data) => {
    const trade = JSON.parse(data);
    const price = parseFloat(trade.p);
    
    priceHistory.push({ timestamp: Date.now(), price });

    // Remove old data (keep last 500 entries)
    if (priceHistory.length > 500) {
        priceHistory.shift();
    }
});

// 🔄 **Detect Whale Transactions**
async function processTransaction(transaction) {
    const { inputs, out, hash, time } = transaction;
    let totalSent = 0;
    let totalReceived = 0;
    let affectedWallets = new Set();

    inputs.forEach(input => {
        if (WHALE_WALLETS.includes(input.prev_out.addr)) {
            affectedWallets.add(input.prev_out.addr);
            totalSent += input.prev_out.value / 1e8; 
        }
    });

    out.forEach(output => {
        if (WHALE_WALLETS.includes(output.addr)) {
            affectedWallets.add(output.addr);
            totalReceived += output.value / 1e8; 
        }
    });

    if (affectedWallets.size > 0) {
        const btcPriceAtTime = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price : "N/A";
        await notifyWhaleTransaction([...affectedWallets], totalSent, totalReceived, hash, btcPriceAtTime);
    }
}

// 🚨 **Send Whale Alert to Telegram**
async function notifyWhaleTransaction(wallets, sent, received, txHash, btcPriceAtTime) {
    const currentPrice = await getBitcoinPrice();
    let message = `
🚨 <b>Whale Alert!</b> 🚨
💰 <b>Wallets Involved:</b> ${wallets.join(", ")}
🔄 <b>Transaction Details:</b>
${sent > 0 ? `📉 <b>Sent:</b> ${sent.toLocaleString()} BTC` : ""}
${received > 0 ? `📈 <b>Received:</b> ${received.toLocaleString()} BTC` : ""}
📊 <b>BTC Price at Transaction:</b> $${btcPriceAtTime}
📊 <b>Current BTC Price:</b> $${currentPrice}
🔗 <a href="https://www.blockchain.com/btc/tx/${txHash}">View Transaction</a>
    `;

    await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: "HTML" });
}

// 📢 **Automated Market Report**
async function postBitcoinAnalysis() {
    try {
        const btcPrice = await getBitcoinPrice();
        const pastPrice = priceHistory.length > 30 ? priceHistory[priceHistory.length - 30].price : btcPrice;
        const priceChange = ((btcPrice - pastPrice) / pastPrice * 100).toFixed(2);
        const trend = priceChange > 0 ? "📈 Uptrend" : "📉 Downtrend";

        let message = `
📢 <b>Bitcoin Market Report</b> 📢
🕒 <b>Time:</b> ${new Date().toLocaleString()}
💰 <b>Current BTC Price:</b> $${btcPrice.toLocaleString()}
📊 <b>2-Hour Change:</b> ${priceChange}% (${trend})
📡 <i>Data from Binance & CoinGecko</i>
        `;

        await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: "HTML" });
        console.log("📡 Market report sent.");
    } catch (error) {
        console.error("⚠️ Error fetching market data:", error);
    }
}
setInterval(postBitcoinAnalysis, 3600000); // Run every 2 hours

// 🚀 **Launch the Bot**
bot.launch();
console.log("✅ BTC Tracking Bot is Running!");
