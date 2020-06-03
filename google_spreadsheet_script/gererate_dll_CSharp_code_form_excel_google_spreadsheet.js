/** 
 * setting
 */
var sJavaPropertySetting = 0; // 0: batFlg, 1:BatFlg, 2:crpmstBatFlg, 3:CrpmstBatFlg

/** 
 * column name with prefix table name, replace to blank
 */
// var cReplaceColStr = 'agcmst_';
var cReplaceColStr = 'crpmst_';
// var cReplaceColStr = 'coopgdsmst_';
// var cReplaceColStr = 'ordmst_';
// var cReplaceColStr = 'orddtl_';
// var cReplaceColStr = 'gdsmst_';  
// var cReplaceColStr = 'invcrp_';
// var cReplaceColStr = 'invspl_';
// var cReplaceColStr = 'invgds_';
// var cReplaceColStr = 'invusr_';
// var cReplaceColStr = 'invoice_';
// var cReplaceColStr = 'rtnreq_';
// var cReplaceColStr = 'splmst_';
// var cReplaceColStr = 'knstbl_';
// var cReplaceColStr = 'cdtdtl_';
// var cReplaceColStr = 'sncdtmst_';

/** 
 * constant
 */
var CHAR = 'CHAR';
var NCHAR = 'NCHAR';
var VARCHAR2 = 'VARCHAR2';
var NVARCHAR2 = 'NVARCHAR2';
var TIMESTAMP = 'TIMESTAMP';
var DATE = 'DATE';
var DATETIME = 'DATETIME';
var FLOAT = 'FLOAT';
var NUMBER = 'NUMBER';
var LONG = 'LONG';
var BINARY_DOUBLE = 'BINARY_DOUBLE';
var BINARY_FLOAT = 'BINARY_FLOAT';
var CLOB = 'CLOB';
var NCLOB = 'NCLOB';
var BLOB = 'BLOB';
var RAW = 'RAW';
var BFILE = 'BFILE';
var ROWID = 'ROWID';

var newLine = '\\n';

/** 
 * common var in sheet
 */
var gActiveSheet = '';
var gMaxRow = ''; // last row of range
var gValuesOfRange = ''; // values of B11:AS84
var gIndexOfLogicalNameOfColumn = ''; // row index カラム名(論理)
var gIndexOfPhysicalNameOfColumn = ''; // row index カラム名(物理)
var gIndexOfColumnType = ''; // row index 型
var gIndexOfColumnSize = ''; // row index サイズ
var gIndexOfColumnDefaultVal = ''; // row index Default
var gIndexOfColumnNotNull = ''; // row index NOT NULL
var gIndexOfColumnRemark = ''; // 備考
var gTblName = ''; // table name
var gTblNameLogic = ''; // table logic name
var gTblNameUpper = ''; // table name to upper

/** 
 * common var in range column
 */
var cPhysicalNameOfColumn = ''; // crpmst_bat_flg or CRPMST_BAT_FLG
var cPhysicalNameOfColumnUpper = ''; // CRPMST_BAT_FLG
var cPhysicalNameOfColumnReplaceTblNameWithCamel = ''; // batFlg
var cPhysicalNameOfColumnReplaceTblNameWithCamelFirstCharUpperCase = ''; // BatFlg
var cPhysicalNameOfColumnNotReplaceTblNameWithCamel = ''; // crpmstBatFlg
var cPhysicalNameOfColumnNotReplaceTblNameWithCamelFirstCharUpperCase = ''; // CrpmstBatFlg
var cTypeVal = '';
var cSizeVal = '';
var cLogicalNameOfColumn = '';
var cConvTypeVal = '';
var cDefaultVal = '';
var cIsLastRow = false;
var cRemark = '';
var cNotNullVal = '';
var isNotNull = false;

var cJavaVarNameInPropertySet = ''; // batFlg or crpmstBatFlg
var cJavaPropertyName = ''; // batFlg or BatFlg or crpmstBatFlg or CrpmstBatFlg
var cJavaPropertyNameFirstCharUpperCase = ''; // BatFlg or CrpmstBatFlg

/** main method */
function execute() {

    /** set global var of sheet */
    setGlobalVar();

    var mkStr = '';

    // mkStr = makeAlterTable();
    // mkStr = makeCreateTable();
    // mkStr = makeSqlScriptInsertSampleData();
    // mkStr = makeStrutsXmlResultMap();
    // mkStr = makeStrutsXmlInsertValues();
    // mkStr = makeStrutsXmlUpdateValues();
    mkStr = makeJavaVariableName();
    // mkStr += makeJavaProperty();
    // mkStr = makeJavaSetSampleDataForProperty();


    if (mkStr != '') {
        Browser.msgBox(mkStr);
        Logger.log(mkStr);
    }
}

/** 
 * SQL data type to DTO data type
 */
function convType(data, size) {

    var unknown = 'unknown';
    var precision = 0;
    var scale = 0;

    if (data == CHAR || data == NCHAR || data == VARCHAR2 || data == NVARCHAR2) {
        return 'string';
    }
    if (data == LONG || data == CLOB || data == NCLOB || data == ROWID) {
        return 'string';
    }
    if (data == BINARY_DOUBLE) {
        return 'double';
    }
    if (data == BINARY_FLOAT) {
        return 'float';
    }

    if (data == FLOAT) return 'decimal';
    if (data == TIMESTAMP) return 'DateTime';
    if (data == DATE) return 'DateTime';

    if (data == BFILE || data == RAW || data == BLOB) {
        return 'byte[]';
    }

    if (data == NUMBER) {
        var arr = size.toString().trim().split(",");
        if (arr.length == 0) {
            return unknown;
        } else if (arr.length == 1) {
            if (!isNumber(arr[0])) {
                return unknown;
            }
            precision = toNumber(arr[0]);
            return getNumericType(precision, 0);
        } else {
            arr[0] = arr[0].toString().trim();
            arr[1] = arr[1].toString().trim();

            if (!isNumber(arr[0]) || !isNumber(arr[1])) {
                return unknown;
            }
            precision = toNumber(arr[0]);
            scale = toNumber(arr[1]);
            return getNumericType(precision, scale);
        }
    }

    return unknown;
}

/** 
 * SQL data numeric type to DTO data numeric type
 */
function getNumericType(precision, scale) {
    if (scale > 0) {
        return "double";
    }

    if (precision <= 4) {
        return "short";
    } else if (precision <= 9) {
        return "int";
    } else if (precision <= 18) {
        return "long";
    } else {
        return "double";
    }
}

/** 
 * is numeric check
 */
function isNumber(val) {

    if (!isNaN(parseFloat(val)) && isFinite(val)) {
        return true;
    } else {
        return false;
    }
}

/** 
 * cast string to number
 */
function toNumber(val) {
    if (isNumber) {
        return parseFloat(val);
    } else {
        return 0;
    }
}

/** 
 * make sample data
 */
function makeDataSample(type, size, logicName) {
    if (type == NUMBER) {
        return 0;
    }
    if (type == TIMESTAMP) {
        return "'" + getCurrentDateTime() + "'";
    }

    if (size == 1) {
        return "'A'";
    } else {
        return "'" + logicName.substring(0, size / 2) + "'";
    }
}

/** 
 * make sample data for java: current timestamp var timestampBatchEnter
 */
function makeDataSampleWithJava(type) {
    if (type == NUMBER) {
        return 0;
    }
    if (type == TIMESTAMP) {
        return "timestampBatchEnter";
    }

    return "null";
}

/** 
 * get current timestamp
 */
function getCurrentDateTime() {
    var today = new Date();
    var date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    return dateTime;
}

/** 
 * change string to camel for var
 */
function convCamel(str, replaceStr) {
    var strs = str.replace(replaceStr, '').split('_');
    var value = strs[0].toLowerCase();

    for (var i = 1; i < strs.length; i++) {
        value += strs[i].charAt(0).toUpperCase() + strs[i].substring(1).toLowerCase();
    }
    return value;
}

/** set global var of sheet */
function setGlobalVar() {

    gActiveSheet = SpreadsheetApp.getActiveSheet();
    gMaxRow = gActiveSheet.getLastRow();
    gValuesOfRange = gActiveSheet.getRange(10, 1, gMaxRow, 50).getValues();
    gIndexOfLogicalNameOfColumn = gValuesOfRange[0].indexOf('カラム名(論理)');
    gIndexOfPhysicalNameOfColumn = gValuesOfRange[0].indexOf('カラム名(物理)');
    gIndexOfColumnType = gValuesOfRange[0].indexOf('型');
    gIndexOfColumnSize = gValuesOfRange[0].indexOf('サイズ');
    gIndexOfColumnDefaultVal = gValuesOfRange[0].indexOf('Default');
    gIndexOfColumnNotNull = gValuesOfRange[0].indexOf('NOTNULL');

    gTblName = gActiveSheet.getRange(8, 10, 1, 1).getValue();
    // gTblName = gActiveSheet.getName();
    gTblNameLogic = gActiveSheet.getRange(2, 2).getValues();
    gTblNameUpper = gTblName.toUpperCase();
}

/** set common var in column range*/
function setCommonVar(row) {

    // crpmst_bat_flg or CRPMST_BAT_FLG
    cPhysicalNameOfColumn = gValuesOfRange[row][gIndexOfPhysicalNameOfColumn];
    // CRPMST_BAT_FLG
    cPhysicalNameOfColumnUpper = cPhysicalNameOfColumn.toUpperCase();
    // batFlg
    cPhysicalNameOfColumnReplaceTblNameWithCamel = convCamel(cPhysicalNameOfColumn, cReplaceColStr);
    // BatFlg
    cPhysicalNameOfColumnReplaceTblNameWithCamelFirstCharUpperCase = cPhysicalNameOfColumnReplaceTblNameWithCamel.charAt(0).toUpperCase() + cPhysicalNameOfColumnReplaceTblNameWithCamel.substring(1, cPhysicalNameOfColumnReplaceTblNameWithCamel.length);
    // crpmstBatFlg
    cPhysicalNameOfColumnNotReplaceTblNameWithCamel = convCamel(cPhysicalNameOfColumn, '');
    // CrpmstBatFlg
    cPhysicalNameOfColumnNotReplaceTblNameWithCamelFirstCharUpperCase = cPhysicalNameOfColumnNotReplaceTblNameWithCamel.charAt(0).toUpperCase() + cPhysicalNameOfColumnNotReplaceTblNameWithCamel.substring(1, cPhysicalNameOfColumnNotReplaceTblNameWithCamel.length);
    cTypeVal = gValuesOfRange[row][gIndexOfColumnType].toUpperCase();
    cSizeVal = gValuesOfRange[row][gIndexOfColumnSize];
    cDefaultVal = gValuesOfRange[row][gIndexOfColumnDefaultVal];
    cRemark = gValuesOfRange[row][gIndexOfColumnRemark];
    cNotNullVal = gValuesOfRange[row][gIndexOfColumnNotNull];
    isNotNull = (cNotNullVal == 'not');

    if (typeof(cDefaultVal) !== "undefined") { cDefaultVal = cDefaultVal.toString().trim(); }
    cNotNullVal = gValuesOfRange[row][gIndexOfColumnNotNull];
    if (typeof(cNotNullVal) !== "undefined") { cNotNullVal = cNotNullVal.toString().trim(); }
    cLogicalNameOfColumn = gValuesOfRange[row][gIndexOfLogicalNameOfColumn];
    cIsLastRow = (gValuesOfRange[row + 1][gIndexOfPhysicalNameOfColumn] == '');

    try {
        cConvTypeVal = convType(cTypeVal, cSizeVal);
    } catch (e) {
        Browser.msgBox("colum name : " + cPhysicalNameOfColumn + " ; err:" + e);
        return false;
    }

    if (sJavaPropertySetting == 0) {
        cJavaVarNameInPropertySet = cPhysicalNameOfColumnReplaceTblNameWithCamel; // batFlg
        cJavaPropertyName = cPhysicalNameOfColumnReplaceTblNameWithCamel; // batFlg
        cJavaPropertyNameFirstCharUpperCase = cPhysicalNameOfColumnReplaceTblNameWithCamelFirstCharUpperCase; // BatFlg
    } else if (sJavaPropertySetting == 1) {
        cJavaVarNameInPropertySet = cPhysicalNameOfColumnReplaceTblNameWithCamel; // batFlg
        cJavaPropertyName = cPhysicalNameOfColumnReplaceTblNameWithCamelFirstCharUpperCase; // BatFlg
        cJavaPropertyNameFirstCharUpperCase = cPhysicalNameOfColumnReplaceTblNameWithCamelFirstCharUpperCase; // BatFlg
    } else if (sJavaPropertySetting == 2) {
        cJavaVarNameInPropertySet = cPhysicalNameOfColumnNotReplaceTblNameWithCamel; // crpmstBatFlg
        cJavaPropertyName = cPhysicalNameOfColumnNotReplaceTblNameWithCamel; // crpmstBatFlg
        cJavaPropertyNameFirstCharUpperCase = cPhysicalNameOfColumnNotReplaceTblNameWithCamelFirstCharUpperCase; // CrpmstBatFlg
    } else if (sJavaPropertySetting == 3) {
        cJavaVarNameInPropertySet = cPhysicalNameOfColumnNotReplaceTblNameWithCamel; // crpmstBatFlg
        cJavaPropertyName = cPhysicalNameOfColumnNotReplaceTblNameWithCamelFirstCharUpperCase; // CrpmstBatFlg
        cJavaPropertyNameFirstCharUpperCase = cPhysicalNameOfColumnNotReplaceTblNameWithCamelFirstCharUpperCase; // CrpmstBatFlg
    }

    return true;
}

/** create Alter Table script */
function makeAlterTable() {

    var ddl = 'ALTER TABLE ' + gTblNameUpper + ' ADD (' + newLine;

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        ddl += cPhysicalNameOfColumnUpper;
        if (cTypeVal.toUpperCase() == TIMESTAMP) {
            ddl += ' TIMESTAMP(6)';
        } else {
            ddl += ' ' + cTypeVal + '(' + cSizeVal + ')';
        }

        if (cDefaultVal != '') {
            ddl += ' DEFAULT ' + cDefaultVal;
        }
        if (isNotNull) {
            ddl += ' NOT NULL';
        }
        if (!cIsLastRow) {
            ddl += ',';
        }

        ddl += newLine;
    }

    ddl += ');';

    return ddl;
}

/** create Crate Table script */
function makeCreateTable() {

    var keyStr = '';
    var keyCol = '';

    var ddl = 'DROP TABLE IF EXISTS ' + gTblName + ';'

    ddl += newLine;

    //    var ddl = 'CREATE TABLE ' + gTblNameUpper + ' (' + newLine;
    ddl += 'CREATE TABLE ' + gTblName + ' (' + newLine;

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        ddl += cPhysicalNameOfColumnUpper;
        if (cTypeVal.toUpperCase() == TIMESTAMP) {
            ddl += ' TIMESTAMP(6)';
        } else if (cTypeVal.toUpperCase() == DATETIME) {
            ddl += ' DATETIME';
        } else if (cSizeVal != '') {
            ddl += ' ' + cTypeVal + '(' + cSizeVal + ')';
        } else {
            ddl += ' ' + cTypeVal;
        }

        if (cDefaultVal != '') {
            ddl += ' DEFAULT ' + cDefaultVal;
        }
        if (isNotNull) {
            ddl += ' NOT NULL';
        }

        //      Browser.msgBox(cRemark);

        if (cRemark.indexOf('主キー') > -1 && (cRemark.indexOf('自動連番') > -1 || cRemark.indexOf('連番') > -1)) {
            ddl += ' AUTO_INCREMENT';
        }

        if (cRemark.indexOf('主キー') > -1) {
            if (keyCol != '') {
                keyCol += ', ' + cPhysicalNameOfColumn;
            } else {
                keyCol = cPhysicalNameOfColumn;
            }
        }

        if (cLogicalNameOfColumn != '') {
            ddl += ' COMMENT ' + "'" + cLogicalNameOfColumn + "'";
        }


        if (!cIsLastRow) {
            ddl += ',';
        }

        ddl += newLine;
    }

    if (keyCol != '') {
        keyStr = ', PRIMARY KEY (' + keyCol + ')';
        ddl += keyStr;
    }

    ddl += ')';


    if (gTblNameLogic != '') {
        ddl += ' COMMENT = ' + "'" + gTblNameLogic + "'";
    }

    ddl += ';';

    return ddl;
}

/** create sql script data insert sample data */
function makeSqlScriptInsertSampleData() {

    var insertData = 'INSERT INTO ' + gTblNameUpper + ' VALUES (' + newLine;

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        insertData += makeDataSample(cTypeVal, cSizeVal, cLogicalNameOfColumn);
        if (!cIsLastRow) {
            insertData += ',';
        }
        insertData += newLine;
    }

    insertData += ');';

    return insertData;
}

/** create Struts Xml ResultMap result tag */
function makeStrutsXmlResultMap() {

    var xml = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        var columnName = cPhysicalNameOfColumnUpper;
        xml += '<result column="' + columnName + '" property="' + cJavaPropertyName + '" jdbcType="' + cTypeVal + '" />' + newLine;
    }

    return xml;
}

/** create Struts Xml insert values variable */
function makeStrutsXmlInsertValues() {

    var xml = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        xml += '#' + cJavaPropertyName + '#';
        if (!cIsLastRow) {
            xml += ',';
        }
        xml += newLine;
    }

    return xml;
}

/** create Struts Xml update values variable */
function makeStrutsXmlUpdateValues() {

    var xml = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        xml += cPhysicalNameOfColumn + ' = #' + cJavaPropertyName + '#';
        if (!cIsLastRow) {
            xml += ',';
        }
        xml += newLine;
    }

    return xml;
}

/** create java variable name */
function makeJavaVariableName() {

    var varName = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        varName += '/// <summary>' + newLine;
        varName += '/// ' + cLogicalNameOfColumn + newLine;
        varName += '/// </summary>' + newLine;
        // varName += '@JsonProperty("' + cPhysicalNameOfColumn + '")' + newLine;
        // varName += '@Column(name = "' + cPhysicalNameOfColumn + '")' + newLine;
        if (isNotNull) {
            varName += '@NotNull(message = "' + cLogicalNameOfColumn + 'を入力してください。")' + newLine;
            varName += '@NotBlank(message = "' + cLogicalNameOfColumn + 'を入力してください。")' + newLine;
        }
        varName += 'private ' + cConvTypeVal + ' ' + cJavaPropertyName + ';' + newLine;
        varName += newLine;
    }

    return varName;
}

/** create java Property */
function makeJavaProperty() {

    var property = '';
    var get = '';
    var set = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        get = '/// <summary>' + newLine;
        get += '/// ' + cLogicalNameOfColumn + 'を取得する' + newLine;
        get += '/// </summary>' + newLine;
        get += '/// <remarks>' + cLogicalNameOfColumn + '</remarks>' + newLine;
        get += 'public ' + cConvTypeVal + ' get' + cJavaPropertyNameFirstCharUpperCase + '() {' + newLine;
        get += 'return this.' + cJavaPropertyName + ';' + newLine;
        get += '}' + newLine;

        set = '/// <summary>' + newLine;
        set += '/// ' + cLogicalNameOfColumn + 'を設定する' + newLine;
        set += '/// </summary>' + newLine;
        set += 'public void set' + cJavaPropertyNameFirstCharUpperCase + '(' + cConvTypeVal + ' ' + cJavaVarNameInPropertySet + ') {' + newLine;
        set += 'this.' + cJavaPropertyName + ' = ' + cJavaVarNameInPropertySet + ';' + newLine;
        set += '}' + newLine;

        property += get + newLine + set + newLine;
    }

    return property;
}

/** create java set sample data for Property */
function makeJavaSetSampleDataForProperty() {

    var dtoJavaVarName = 'cdtdtl';
    var setDtoDataWithJava = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if (!setCommonVar(i)) {
            return '';
        }

        if (cPhysicalNameOfColumn == '') {
            break;
        }

        setDtoDataWithJava += dtoJavaVarName + ".set" + cJavaPropertyNameFirstCharUpperCase + "(";
        setDtoDataWithJava += makeDataSampleWithJava(cTypeVal);
        setDtoDataWithJava += ');' + newLine;
    }

    return setDtoDataWithJava;
}

function getSheetnames() {
    // var out = new Array()
    var str = "";
    var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    for (var i = 0; i < sheets.length; i++) {
        // out.push([sheets[i].getName()])
        str += sheets[i].getName() + newLine;
    }
    Browser.msgBox(str);
    // return out
}