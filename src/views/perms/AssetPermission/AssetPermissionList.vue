<template>
  <Page :help-message="helpMsg" v-bind="$attrs">
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
    <PermBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
      @update="handlePermBulkUpdate"
    />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import PermBulkUpdateDialog from './components/PermBulkUpdateDialog'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter'
import { mapGetters } from 'vuex'
import { AccountLabelMapper, AssetPermissionListPageSearchConfigOptions } from '../const'

export default {
  components: {
    Page,
    AssetTreeTable,
    PermBulkUpdateDialog
  },
  data() {
    const vm = this
    return {
      helpMsg: this.$t('perms.AssetPermissionHelpMsg'),
      treeSetting: {
        showMenu: false,
        showAssets: true,
        notShowBuiltinTree: true,
        url: '/api/v1/perms/asset-permissions/',
        nodeUrl: '/api/v1/perms/asset-permissions/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        hasTree: true,
        columnsExtra: ['action'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'users', 'user_groups', 'assets',
            'nodes', 'accounts', 'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionDetail'
              }
            }
          },
          action: {
            label: this.$t('common.Action'),
            formatter: function(row) {
              if (row.actions.length === 6) {
                return vm.$t('common.All')
              }
              return row.actions.map(item => {
                return item.label.replace(/ \([^)]*\)/, '')
              }).join(',')
            }
          },
          is_expired: {
            formatterArgs: {
              showFalse: false
            }
          },
          from_ticket: {
            label: this.$t('perms.fromTicket'),
            width: 100,
            formatterArgs: {
              showFalse: false
            }
          },
          users: {
            label: this.$t('perms.User'),
            width: '60px',
            formatter: AmountFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          user_groups: {
            label: this.$t('perms.UserGroups'),
            width: '100px',
            formatter: AmountFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          assets: {
            label: this.$t('perms.Asset'),
            width: '60px',
            formatter: AmountFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          nodes: {
            label: this.$t('perms.Node'),
            width: '60px',
            formatter: AmountFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          accounts: {
            label: this.$t('perms.Account'),
            width: '60px',
            formatter: AmountFormatter,
            formatterArgs: {
              getItem(item) {
                if (item !== '@SPEC') {
                  return AccountLabelMapper[item] || item
                }
              },
              routeQuery: {
                activeTab: 'AssetPermissionAccount'
              }
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AssetPermissionUpdate',
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/perms/asset-permissions/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        hasLabelSearch: true,
        hasBulkDelete: true,
        createRoute() {
          return {
            name: 'AssetPermissionCreate',
            query: this.$route.query
          }
        },
        handleImportClick: ({ selectedRows }) => {
          this.$eventBus.$emit('showImportDialog', {
            selectedRows,
            url: '/api/v1/perms/asset-permissions/'
          })
        },
        createInNewPage: true,
        searchConfig: {
          url: '',
          options: AssetPermissionListPageSearchConfigOptions
        },
        hasBulkUpdate: true,
        handleBulkUpdate: ({ selectedRows }) => {
          this.updateSelectedDialogSetting.selectedRows = selectedRows
          this.updateSelectedDialogSetting.visible = true
        }
      },
      updateSelectedDialogSetting: {
        visible: false,
        selectedRows: []
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  methods: {
    handlePermBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.$refs.AssetTreeTable.$refs.TreeList.$refs?.ListTable?.reloadTable()
    }
  }
}
</script>

<style>

</style>
