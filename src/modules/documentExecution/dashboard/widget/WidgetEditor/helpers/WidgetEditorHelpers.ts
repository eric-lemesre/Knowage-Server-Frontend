import { createNewDiscoveryWidgetSettings } from './discoveryWidget/DiscoveryWidgetFunctions';
import { formatVegaForSave } from './chartWidget/vega/VegaBackendSaveHelper';
import { formatVegaWidget, createNewVegaSettings } from './chartWidget/vega/VegaHelpers';
import { IWidget, IWidgetColumn } from '../../../Dashboard'
import { formatTableWidgetForSave } from './tableWidget/TableWidgetBackendSaveHelper'
import { createNewTableWidgetSettings } from '../helpers/tableWidget/TableWidgetFunctions'
import { createNewSelectorWidgetSettings } from '../helpers/selectorWidget/SelectorWidgetFunctions'
import { createNewSelectionsWidgetSettings } from '../helpers/selectionsWidget/SelectionsWidgetFunctions'
import { createNewHtmlWidgetSettings } from './htmlWidget/HTMLWidgetFunctions'
import { createNewTextWidgetSettings } from './textWidget/TextWidgetFunctions'
import { createNewChartJSSettings, formatChartJSWidget } from './chartWidget/chartJS/ChartJSHelpers'
import { createNewHighchartsSettings, formatHighchartsWidget } from './chartWidget/highcharts/HighchartsHelpers'
import { formatHighchartsWidgetForSave } from './chartWidget/highcharts/HighchartsBackendSaveHelper'
import { formatChartJSForSave } from './chartWidget/chartJS/ChartJSBackendSaveHelper'
import { createNewImageWidgetSettings } from './imageWidget/ImageWidgetFunctions'
import { createNewCustomChartSettings } from './customchart/CustomChartFunctions'
import { createNewPivotTableWidgetSettings } from './pivotTableWidget/PivotTableFunctions'
import cryptoRandomString from 'crypto-random-string'
import deepcopy from 'deepcopy'
import useStore from '@/App.store'
import { createNewMapWidgetSettings } from './mapWidget/MapWidgetFunctions';

const store = useStore()

export function createNewWidget(type: string) {
    const widget = {
        id: cryptoRandomString({ length: 16, type: 'base64' }),
        new: true,
        type: type,
        dataset: null,
        columns: [],
        settings: {}
    } as IWidget
    if (widget.type === 'static-pivot-table') widget.fields = { columns: [], rows: [], data: [], filters: [] }

    createNewWidgetSettings(widget)

    return widget
}

export const createNewWidgetColumn = (eventData: any, widgetType: string) => {
    const tempColumn = {
        id: cryptoRandomString({ length: 16, type: 'base64' }),
        columnName: eventData.name,
        alias: eventData.alias,
        type: eventData.type,
        fieldType: eventData.fieldType,
        filter: {}
    } as IWidgetColumn
    if (tempColumn.fieldType === 'MEASURE') tempColumn.aggregation = 'SUM'
    else if (widgetType === 'discovery' && tempColumn.fieldType === 'ATTRIBUTE') tempColumn.aggregation = 'COUNT'
    return tempColumn
}

const createNewWidgetSettings = (widget: IWidget) => {
    switch (widget.type) {
        case 'table':
            widget.settings = createNewTableWidgetSettings()
            break
        case 'selector':
            widget.settings = createNewSelectorWidgetSettings()
            break
        case 'selection':
            widget.settings = createNewSelectionsWidgetSettings()
            break
        case 'html':
            widget.settings = createNewHtmlWidgetSettings()
            break
        case 'text':
            widget.settings = createNewTextWidgetSettings()
            break
        case 'chartJS':
            widget.settings = createNewChartJSSettings()
            break
        case 'highcharts':
            widget.settings = createNewHighchartsSettings()
            break
        case 'image':
            widget.settings = createNewImageWidgetSettings()
            break
        case 'customchart':
            widget.settings = createNewCustomChartSettings()
            break
        case 'static-pivot-table':
            widget.settings = createNewPivotTableWidgetSettings()
            break
        case 'discovery':
            widget.settings = createNewDiscoveryWidgetSettings()
            break
        case 'vega':
            widget.settings = createNewVegaSettings()
            break
        case 'map':
            widget.layers = []
            widget.settings = createNewMapWidgetSettings()
            break
    }
}

export function formatWidgetForSave(tempWidget: IWidget) {
    if (!tempWidget) return null

    const widget = deepcopy(tempWidget)

    switch (widget.type) {
        case 'table':
            formatTableWidgetForSave(widget)
            break
        case 'highcharts':
            formatHighchartsWidgetForSave(widget)
            break
        case 'chartJS':
            formatChartJSForSave(widget)
            break
        case 'vega':

            formatVegaForSave(widget)
    }
    ['state', 'search', 'invalid'].forEach((property: string) => delete widget[property])
    return widget
}

export function getRGBColorFromString(color: string) {
    const temp = color
        ?.trim()
        ?.substring(5, color.length - 1)
        ?.split(',')

    const alpha = isNaN(+temp[3]) ? 1 : +temp[3]
    if (temp) {
        return { r: +temp[0], g: +temp[1], b: +temp[2], a: alpha }
    } else return { r: 0, g: 0, b: 0, a: 0 }
}

export const recreateKnowageChartModel = (widget: IWidget) => {
    if (widget.type === 'chartJS') formatChartJSWidget(widget)
    else if (widget.type === 'highcharts' && store.user.enterprise) formatHighchartsWidget(widget)
    else if (widget.type === 'vega') formatVegaWidget(widget)
}
