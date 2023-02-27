import i18n from '@/i18n/i18n'
import ProtocolSelector from '@/components/FormFields/ProtocolSelector'
import AssetAccounts from '@/views/assets/Asset/AssetCreateUpdate/components/AssetAccounts'
import rules from '@/components/DataForm/rules'
import { Select2 } from '@/components/FormFields'
import { Message } from '@/utils/Message'

export const filterSelectValues = (values) => {
  if (!values) return
  const selects = []
  values.forEach((item) => {
    if (item.hasOwnProperty('pk')) {
      selects.push(item)
    } else {
      // 格式校验：不以:开头，不以:结尾
      const rule = /^(?!:).*(?<!:)$/
      if (item.name.indexOf(':') > -1 && rule.test(item.name)) {
        const [name, value] = item.name.split(':')
        const inputValue = { name, value }
        selects.push(inputValue)
      } else {
        Message.error(i18n.t('assets.LabelInputFormatValidation'))
      }
    }
  })
  return selects
}

export const assetFieldsMeta = (vm) => {
  const platformProtocols = []
  const secretTypes = []
  const platformType = vm?.$route.query.platform_type
  return {
    address: {
      rules: [rules.IpCheck, rules.specialEmojiCheck]
    },
    protocols: {
      component: ProtocolSelector,
      el: {
        settingReadonly: true,
        choices: platformProtocols
      },
      on: {
        input: ([value]) => {
          const protocolSecretTypes = platformProtocols.reduce((pre, cur) => {
            pre[cur.name] = cur['secret_types']
            return pre
          }, {})
          const _secretTypes = value.map(v => v.name).reduce((pre, name) => {
            if (protocolSecretTypes[name]) {
              return pre.concat(protocolSecretTypes[name])
            }
            return pre
          }, [])
          secretTypes.splice(0, secretTypes.length, ..._secretTypes)
        }
      }
    },
    platform: {
      el: {
        multiple: false,
        ajax: {
          url: `/api/v1/assets/platforms/?type=${platformType}`,
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        }
      }
    },
    domain: {
      component: Select2,
      disabled: false,
      el: {
        multiple: false,
        clearable: true,
        ajax: {
          url: '/api/v1/assets/domains/'
        }
      }
    },
    accounts: {
      component: AssetAccounts,
      label: i18n.t('assets.Accounts'),
      el: {
        platform: {},
        default: []
      }
    },
    nodes: {
      rules: [rules.RequiredChange],
      el: {
        ajax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: `${item.full_value}`, value: item.id }
          }
        },
        clearable: true
      }
    },
    labels: {
      el: {
        ajax: {
          url: '/api/v1/assets/labels/',
          transformOption: (item) => {
            return { label: `${item.name}:${item.value}`, value: item.id }
          }
        },
        allowCreate: true
      },
      on: {
        change: ([event], updateForm) => {
          const selects = filterSelectValues(event)
          updateForm({ labels: selects })
        }
      }
    },
    is_active: {
      type: 'switch'
    },
    cluster: {
      label: i18n.t('assets.Cluster')
    },
    url: {
      label: 'url'
    }
  }
}
