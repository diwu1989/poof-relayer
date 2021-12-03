const { isAddress, toChecksumAddress } = require('web3-utils')
const { getInstance } = require('./utils')
const { rewardAccount, pools } = require('./config')

const Ajv = require('ajv')
const ajv = new Ajv({ format: 'fast' })

ajv.addKeyword('isAddress', {
  validate: (schema, data) => {
    try {
      return isAddress(data)
    } catch (e) {
      return false
    }
  },
  errors: true,
})

ajv.addKeyword('isKnownContract', {
  validate: (schema, data) => {
    try {
      return getInstance(data) !== null
    } catch (e) {
      return false
    }
  },
  errors: true,
})

ajv.addKeyword('isKnownPool', {
  validate: (schema, data) => {
    try {
      return (
        pools.find(entry => entry.poolAddress.toLowerCase() === data) !== null
      )
    } catch (e) {
      return false
    }
  },
  errors: true,
})

ajv.addKeyword('isFeeRecipient', {
  validate: (schema, data) => {
    try {
      return toChecksumAddress(rewardAccount) === toChecksumAddress(data)
    } catch (e) {
      return false
    }
  },
  errors: true,
})

const addressType = {
  type: 'string',
  pattern: '^0x[a-fA-F0-9]{40}$',
  isAddress: true,
}
const proofType = { type: 'string', pattern: '^0x[a-fA-F0-9]{512}$' }
const v2ProofType = { type: 'string', pattern: '^0x[a-fA-F0-9]{1600}$' }
const v3ProofType = { type: 'string', pattern: '^0x[a-fA-F0-9]{1600}$' }
const v4ProofType = { type: 'string', pattern: '^0x[a-fA-F0-9]{512}$' }
const rewardArgType = { type: 'string', pattern: '^0x[a-fA-F0-9]{2176}$' }
const encryptedAccountType = { type: 'string', pattern: '^0x[a-fA-F0-9]{392}$' }
const encryptedAccountV2Type = {
  type: 'string',
  pattern: '^0x[a-fA-F0-9]{480}$',
}
const encryptedAccountV4Type = {
  type: 'string',
  pattern: '^0x[a-fA-F0-9]{560}$',
}
const bytes32Type = { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' }
const instanceType = { ...addressType, isKnownContract: true }
const poolType = { ...addressType, isKnownPool: true }
const relayerType = { ...addressType, isFeeRecipient: true }

const poofWithdrawSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    contract: instanceType,
    args: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: [
        bytes32Type,
        bytes32Type,
        addressType,
        relayerType,
        bytes32Type,
        bytes32Type,
      ],
    },
  },
  additionalProperties: false,
  required: ['proof', 'contract', 'args'],
}

const miningArgs = {
  type: 'object',
  properties: {
    rate: bytes32Type,
    fee: bytes32Type,
    instance: instanceType,
    rewardNullifier: bytes32Type,
    extDataHash: bytes32Type,
    depositRoot: bytes32Type,
    withdrawalRoot: bytes32Type,
    extData: {
      type: 'object',
      properties: {
        relayer: relayerType,
        encryptedAccount: encryptedAccountType,
      },
      additionalProperties: false,
      required: ['relayer', 'encryptedAccount'],
    },
    account: {
      type: 'object',
      properties: {
        inputRoot: bytes32Type,
        inputNullifierHash: bytes32Type,
        outputRoot: bytes32Type,
        outputPathIndices: bytes32Type,
        outputCommitment: bytes32Type,
      },
      additionalProperties: false,
      required: [
        'inputRoot',
        'inputNullifierHash',
        'outputRoot',
        'outputPathIndices',
        'outputCommitment',
      ],
    },
  },
  additionalProperties: false,
  required: [
    'rate',
    'fee',
    'instance',
    'rewardNullifier',
    'extDataHash',
    'depositRoot',
    'withdrawalRoot',
    'extData',
    'account',
  ],
}

const miningRewardSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    args: miningArgs,
  },
  additionalProperties: false,
  required: ['proof', 'args'],
}

const batchRewardSchema = {
  type: 'object',
  properties: {
    rewardArgs: {
      type: 'array',
      items: rewardArgType,
    },
    args: {
      type: 'array',
      items: miningArgs,
    },
  },
  additionalProperties: false,
  required: ['rewardArgs', 'args'],
}

const withdrawArgs = {
  type: 'object',
  properties: {
    amount: bytes32Type,
    extDataHash: bytes32Type,
    extData: {
      type: 'object',
      properties: {
        fee: bytes32Type,
        recipient: addressType,
        relayer: relayerType,
        encryptedAccount: encryptedAccountType,
      },
      additionalProperties: false,
      required: ['fee', 'relayer', 'encryptedAccount', 'recipient'],
    },
    account: {
      type: 'object',
      properties: {
        inputRoot: bytes32Type,
        inputNullifierHash: bytes32Type,
        outputRoot: bytes32Type,
        outputPathIndices: bytes32Type,
        outputCommitment: bytes32Type,
      },
      additionalProperties: false,
      required: [
        'inputRoot',
        'inputNullifierHash',
        'outputRoot',
        'outputPathIndices',
        'outputCommitment',
      ],
    },
  },
  additionalProperties: false,
  required: ['amount', 'extDataHash', 'extData', 'account'],
}

const miningWithdrawSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    args: withdrawArgs,
  },
  additionalProperties: false,
  required: ['proof', 'args'],
}

const withdrawV2Args = {
  ...withdrawArgs,
  properties: {
    ...withdrawArgs.properties,
    debt: bytes32Type,
    unitPerUnderlying: bytes32Type,
    extData: {
      type: 'object',
      properties: {
        fee: bytes32Type,
        recipient: addressType,
        relayer: relayerType,
        depositProofHash: bytes32Type,
        encryptedAccount: encryptedAccountV2Type,
      },
      additionalProperties: false,
      required: [
        'fee',
        'relayer',
        'encryptedAccount',
        'recipient',
        'depositProofHash',
      ],
    },
  },
  required: [
    'amount',
    'debt',
    'unitPerUnderlying',
    'extDataHash',
    'extData',
    'account',
  ],
}

const withdrawV2Schema = {
  type: 'object',
  properties: {
    contract: poolType,
    proof: v2ProofType,
    args: withdrawV2Args,
  },
  additionalProperties: false,
  required: ['proof', 'contract', 'args'],
}

const withdrawV3Args = {
  ...withdrawArgs,
  properties: {
    ...withdrawArgs.properties,
    debt: bytes32Type,
    unitPerUnderlying: bytes32Type,
    extData: {
      type: 'object',
      properties: {
        fee: bytes32Type,
        recipient: addressType,
        relayer: relayerType,
        encryptedAccount: encryptedAccountV2Type,
      },
      additionalProperties: false,
      required: ['fee', 'relayer', 'encryptedAccount', 'recipient'],
    },
    account: {
      type: 'object',
      properties: {
        inputRoot: bytes32Type,
        inputNullifierHash: bytes32Type,
        inputAccountHash: bytes32Type,
        outputRoot: bytes32Type,
        outputPathIndices: bytes32Type,
        outputCommitment: bytes32Type,
        outputAccountHash: bytes32Type,
      },
      additionalProperties: false,
      required: [
        'inputRoot',
        'inputNullifierHash',
        'inputAccountHash',
        'outputRoot',
        'outputPathIndices',
        'outputCommitment',
        'outputAccountHash',
      ],
    },
  },
  required: [
    'amount',
    'debt',
    'unitPerUnderlying',
    'extDataHash',
    'extData',
    'account',
  ],
}

const withdrawV4Args = {
  ...withdrawV3Args,
  properties: {
    ...withdrawV3Args.properties,
    extData: {
      type: 'object',
      properties: {
        fee: bytes32Type,
        recipient: addressType,
        relayer: relayerType,
        encryptedAccount: encryptedAccountV4Type,
      },
      additionalProperties: false,
      required: ['fee', 'relayer', 'encryptedAccount', 'recipient'],
    },
  },
  required: [
    'amount',
    'debt',
    'unitPerUnderlying',
    'extDataHash',
    'extData',
    'account',
  ],
}

const withdrawV3Schema = {
  type: 'object',
  properties: {
    contract: poolType,
    proofs: {
      type: 'array',
      maxItems: 3,
      mintItems: 3,
      items: [v3ProofType, v3ProofType, v3ProofType],
    },
    args: withdrawV3Args,
  },
  additionalProperties: false,
  required: ['proofs', 'contract', 'args'],
}

const withdrawV4Schema = {
  type: 'object',
  properties: {
    contract: poolType,
    proofs: {
      type: 'array',
      maxItems: 3,
      mintItems: 3,
      items: [v4ProofType, v4ProofType, v4ProofType],
    },
    args: withdrawV4Args,
  },
  additionalProperties: false,
  required: ['proofs', 'contract', 'args'],
}

const validateTornadoWithdraw = ajv.compile(poofWithdrawSchema)
const validateMiningReward = ajv.compile(miningRewardSchema)
const validateBatchReward = ajv.compile(batchRewardSchema)
const validateMiningWithdraw = ajv.compile(miningWithdrawSchema)
const validateWithdrawV2 = ajv.compile(withdrawV2Schema)
const validateWithdrawV3 = ajv.compile(withdrawV3Schema)
const validateWithdrawV4 = ajv.compile(withdrawV4Schema)

function getInputError(validator, data) {
  validator(data)
  if (validator.errors) {
    const error = validator.errors[0]
    return `${error.dataPath} ${error.message}`
  }
  return null
}

function getTornadoWithdrawInputError(data) {
  return getInputError(validateTornadoWithdraw, data)
}

function getMiningRewardInputError(data) {
  return getInputError(validateMiningReward, data)
}

function getBatchRewardInputError(data) {
  return getInputError(validateBatchReward, data)
}

function getMiningWithdrawInputError(data) {
  return getInputError(validateMiningWithdraw, data)
}

function getWithdrawV2InputError(data) {
  return getInputError(validateWithdrawV2, data)
}

function getWithdrawV3InputError(data) {
  return getInputError(validateWithdrawV3, data)
}

function getWithdrawV4InputError(data) {
  return getInputError(validateWithdrawV4, data)
}

module.exports = {
  getTornadoWithdrawInputError,
  getMiningRewardInputError,
  getBatchRewardInputError,
  getMiningWithdrawInputError,

  getWithdrawV2InputError,
  getWithdrawV3InputError,
  getWithdrawV4InputError,
}
