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
var TIMESTAMP = 'TIMESTAMP';
var VARCHAR2 = 'VARCHAR2';
var FLOAT = 'FLOAT';
var NUMBER = 'NUMBER';

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
var gTblName = ''; // table name
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
    mkStr += makeJavaProperty();
    // mkStr = makeJavaSetSampleDataForProperty();


    if(mkStr != '') {
        Browser.msgBox(mkStr);
    }
}

/** 
 * SQL data type to DTO data type
*/
function convType(data, size) {

    var unknown = 'unknown';
    var precision = 0;
    var scale = 0;

    if (data == VARCHAR2) return 'String';
    if (data == TIMESTAMP) return 'Timestamp';
    if (data == FLOAT) return 'Double';

    if (data == NUMBER) {
        var arr = size.toString().trim().split(",");
        if (arr.length == 0) {
            return unknown;
        }
        else if(arr.length == 1) {
            if (!isNumber(arr[0])) {
                return unknown;
            }
            precision = toNumber(arr[0]);
            return getNumericType(precision, 0);
        }
        else {
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
        return "BigDecimal";
    }

    if (precision <= 4) {
        return "Short";
    }
    else if (precision <= 9) {
        return "Integer";
    }
    else if (precision <= 18) {
        return "Long";
    }
    else {
        return "BigDecimal";
    }
}

/** 
 * is numeric check
*/
function isNumber(val) {

    if (!isNaN(parseFloat(val)) && isFinite(val)) {
        return true;
    }
    else {
        return false;
    }
}

/** 
 * cast string to number
*/
function toNumber(val) {
    if (isNumber) {
        return parseFloat(val);
    }
    else {
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
    }
    else {
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
    cTypeVal = gValuesOfRange[row][gIndexOfColumnType];
    cSizeVal = gValuesOfRange[row][gIndexOfColumnSize];
    cDefaultVal = gValuesOfRange[row][gIndexOfColumnDefaultVal];
    if (typeof (cDefaultVal) !== "undefined") { cDefaultVal = cDefaultVal.toString().trim(); }
    notNullVal = gValuesOfRange[row][gIndexOfColumnNotNull];
    if (typeof (notNullVal) !== "undefined") { notNullVal = notNullVal.toString().trim(); }
    cLogicalNameOfColumn = gValuesOfRange[row][gIndexOfLogicalNameOfColumn];
    cIsLastRow = (gValuesOfRange[row + 1][gIndexOfPhysicalNameOfColumn] == '');

    try {
        cConvTypeVal = convType(cTypeVal, cSizeVal);
    }
    catch (e) {
        Browser.msgBox("colum name : " + cPhysicalNameOfColumn + " ; err:" + e);
        return false;
    }
    
    if(sJavaPropertySetting == 0) {
        cJavaVarNameInPropertySet = cPhysicalNameOfColumnReplaceTblNameWithCamel; // batFlg
        cJavaPropertyName = cPhysicalNameOfColumnReplaceTblNameWithCamel; // batFlg
        cJavaPropertyNameFirstCharUpperCase = cPhysicalNameOfColumnReplaceTblNameWithCamelFirstCharUpperCase; // BatFlg
    }
    else if(sJavaPropertySetting == 1) {
        cJavaVarNameInPropertySet = cPhysicalNameOfColumnReplaceTblNameWithCamel; // batFlg
        cJavaPropertyName = cPhysicalNameOfColumnReplaceTblNameWithCamelFirstCharUpperCase; // BatFlg
        cJavaPropertyNameFirstCharUpperCase = cPhysicalNameOfColumnReplaceTblNameWithCamelFirstCharUpperCase; // BatFlg
    }
    else if(sJavaPropertySetting == 2) {
        cJavaVarNameInPropertySet = cPhysicalNameOfColumnNotReplaceTblNameWithCamel; // crpmstBatFlg
        cJavaPropertyName = cPhysicalNameOfColumnNotReplaceTblNameWithCamel; // crpmstBatFlg
        cJavaPropertyNameFirstCharUpperCase = cPhysicalNameOfColumnNotReplaceTblNameWithCamelFirstCharUpperCase; // CrpmstBatFlg
    }
    else if(sJavaPropertySetting == 3) {
        cJavaVarNameInPropertySet = cPhysicalNameOfColumnNotReplaceTblNameWithCamel; // crpmstBatFlg
        cJavaPropertyName = cPhysicalNameOfColumnNotReplaceTblNameWithCamelFirstCharUpperCase; // CrpmstBatFlg
        cJavaPropertyNameFirstCharUpperCase = cPhysicalNameOfColumnNotReplaceTblNameWithCamelFirstCharUpperCase; // CrpmstBatFlg
    }

    return true;
}

/** create Alter Table script */
function makeAlterTable() {
    
    var ddl = 'ALTER TABLE ' + gTblNameUpper + ' ADD (' + '\r';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }

        ddl += cPhysicalNameOfColumnUpper;
        if (cTypeVal.toUpperCase() == TIMESTAMP) {
            ddl += ' TIMESTAMP(6)';
        }
        else {
            ddl += ' ' + cTypeVal + '(' + cSizeVal + ')';
        }

        if (cDefaultVal != '') {
            ddl += ' DEFAULT ' + cDefaultVal;
        }
        if (notNullVal == '○') {
            ddl += ' NOT NULL';
        }
        if (!cIsLastRow) {
            ddl += ',';
        }
        
        ddl += '\r';
    }

    ddl += ');';

    return ddl;
}

/** create Crate Table script */
function makeCreateTable() {

    var ddl = 'CREATE TABLE ' + gTblNameUpper + ' (' + '\r';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }

        ddl += cPhysicalNameOfColumnUpper;
        if (cTypeVal.toUpperCase() == TIMESTAMP) {
            ddl += ' TIMESTAMP(6)';
        }
        else {
            ddl += ' ' + cTypeVal + '(' + cSizeVal + ')';
        }

        if (cDefaultVal != '') {
            ddl += ' DEFAULT ' + cDefaultVal;
        }
        if (notNullVal == '○') {
            ddl += ' NOT NULL';
        }
        if (!cIsLastRow) {
            ddl += ',';
        }
        
        ddl += '\r';
    }

    ddl += ');';

    return ddl;
}

/** create sql script data insert sample data */
function makeSqlScriptInsertSampleData() {

    var insertData = 'INSERT INTO ' + gTblNameUpper + ' VALUES ( \r';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }

        insertData += makeDataSample(cTypeVal, cSizeVal, cLogicalNameOfColumn);
        if (!cIsLastRow) {
            insertData += ',';
        }
        insertData += '\r';
    }

    insertData += ');';

    return insertData;
}

/** create Struts Xml ResultMap result tag */
function makeStrutsXmlResultMap() {

    var xml = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }
        
        var columnName = cPhysicalNameOfColumnUpper;
        xml += '<result column="' + columnName + '" property="' + cJavaPropertyName + '" jdbcType="' + cTypeVal + '" />' + '\r';
    }

    return xml;
}

/** create Struts Xml insert values variable */
function makeStrutsXmlInsertValues() {

    var xml = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }

        xml += '#' + cJavaPropertyName + '#';
        if (!cIsLastRow) {
            xml += ',';
        }
        xml += '\r';
    }

    return xml;
}

/** create Struts Xml update values variable */
function makeStrutsXmlUpdateValues() {

    var xml = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }

        xml += cPhysicalNameOfColumn + ' = #' + cJavaPropertyName + '#';
        if (!cIsLastRow) {
            xml += ',';
        }
        xml += '\r';
    }

    return xml;
}

/** create java variable name */
function makeJavaVariableName() {

    var varName = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }

        varName += '/**' + '\r';
        varName += ' * ' + cLogicalNameOfColumn + '\r';
        varName += ' **/' + '\r';
        // varName += '@JsonProperty("' + cPhysicalNameOfColumn + '")' + '\r';
        // varName += '@Column(name = "' + cPhysicalNameOfColumn + '")' + '\r';
        varName += 'private ' + cConvTypeVal + ' ' + cJavaPropertyName + ';' + '\r';
        varName += '\r';
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
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }

        get = '/**' + '\r';
        get += ' * ' + cLogicalNameOfColumn + 'を取得する\r';
        get += ' * @return ' + cLogicalNameOfColumn + '\r';
        get += ' **/' + '\r';
        get += 'public ' + cConvTypeVal + ' get' + cJavaPropertyNameFirstCharUpperCase + '() {' + '\r';
        get += 'return this.' + cJavaPropertyName + ';' + '\r';
        get += '}' + '\r';

        set = '/**' + '\r';
        set += ' * ' + cLogicalNameOfColumn + 'を設定する\r';
        set += ' **/' + '\r';
        set += 'public void set' + cJavaPropertyNameFirstCharUpperCase + '(' + cConvTypeVal + ' ' + cJavaVarNameInPropertySet + ') {' + '\r';
        set += 'this.' + cJavaPropertyName + ' = ' + cJavaVarNameInPropertySet + ';' + '\r';
        set += '}' + '\r';

        property += get + '\r' + set + '\r';
    }

    return property;
}

/** create java set sample data for Property */
function makeJavaSetSampleDataForProperty() {
    
    var dtoJavaVarName = 'cdtdtl';
    var setDtoDataWithJava = '';

    for (var i = 1; i < gValuesOfRange.length; i++) {

        /** set common var in column range*/
        if(!setCommonVar(i)) {
            return '';
        }
        
        if (cPhysicalNameOfColumn == '') {
            break;
        }

        setDtoDataWithJava += dtoJavaVarName + ".set" + cJavaPropertyNameFirstCharUpperCase + "(";
        setDtoDataWithJava += makeDataSampleWithJava(cTypeVal);
        setDtoDataWithJava += ');\r';
    }

    return setDtoDataWithJava;
}