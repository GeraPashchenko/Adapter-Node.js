
var http = require('http');
const fs = require('fs');
var iconv = require('iconv-lite');
var express = require('express');
var constructors = require('./constructors');
var MyFunc = require('./MyFunc');

// создаём Express-приложение
var app = express();
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('index.ejs');
});

app.get("/groupsForm.ejs", function (req, res) {
  res.render("groupsForm");
});

app.get("/teachersForm.ejs", function (req, res) {
  res.render("teachersForm");
});

app.get('/teacher', function (req, res) {
  let listOfTeacherIds = [];//список всех найденых id групп 
  let buffListOfTeachers = [];//буферный список
  let teachersFromCist = fs.readFileSync("./json/teachersID.json", 'utf8');
  teachersFromCist = JSON.parse(teachersFromCist);

  MyFunc.getObjectValue(teachersFromCist, 'teachers', buffListOfTeachers);//получаем все группы вместе с их id из общего файла хнурэ в список L[]

  for (let i = 0; i < buffListOfTeachers.length; i++) { // парсим каждый полученый объект и из него забираем все найденые группы
    buffListOfTeachers[i] = JSON.parse(buffListOfTeachers[i]);
    buffListOfTeachers[i].forEach(function (e) {
      listOfTeacherIds.push(new constructors.groups(e.short_name, e.id));
    })
  }
  for (let i = 0; i < listOfTeacherIds.length; i++) {
    if (listOfTeacherIds[i].name == req.query.teacher) {
      var id = listOfTeacherIds[i].id;
    }
  }
  let file = fs.createWriteStream("csv/fileFromCist.csv");
  let strzapr = "http://cist.nure.ua/ias/app/tt/WEB_IAS_TT_GNR_RASP.GEN_TEACHER_KAF_RASP?ATypeDoc=3&Aid_sotr=" + id + "&Aid_kaf=0&ADateStart=" + req.query.start + "&ADateEnd=" + req.query.end + "&AMultiWorkSheet=0"
  let request = http.get(strzapr, function (response) {
    response.pipe(file);
    Parsing();
  });
  var FinalJson = fs.readFileSync("./json/Final.json", 'utf8');
  res.end(FinalJson);
});

app.get('/groups', function (req, res) {//обработка запроса расписания групп из формы groupsForm
  let listOfGroupIds = [];//список всех найденых id групп 
  let buffListOfGroups = [];//буферный список
  let groupsFromCist = fs.readFileSync("./json/groups_writed.json", 'utf8');
  groupsFromCist = JSON.parse(groupsFromCist);

  MyFunc.getObjectValue(groupsFromCist, 'groups', buffListOfGroups);//получаем все группы вместе с их id из общего файла хнурэ в список L[]

  for (let i = 0; i < buffListOfGroups.length; i++) { // парсим каждый полученый объект и из него забираем все найденые группы
    buffListOfGroups[i] = JSON.parse(buffListOfGroups[i]);
    buffListOfGroups[i].forEach(function (e) {
      listOfGroupIds.push(new constructors.groups(e.name, e.id));
    })
  }
  for (let i = 0; i < listOfGroupIds.length; i++) {
    if (listOfGroupIds[i].name == req.query.group) {
      var id = listOfGroupIds[i].id;
    }
  }
  let file = fs.createWriteStream("csv/fileFromCist.csv");
  let strzapr = "http://cist.nure.ua/ias/app/tt/WEB_IAS_TT_GNR_RASP.GEN_GROUP_POTOK_RASP?ATypeDoc=3&Aid_group=" + id + "&Aid_potok=0&ADateStart=" + req.query.start + "&ADateEnd=" + req.query.end + "&AMultiWorkSheet=0"
  let request = http.get(strzapr, function (response) {
    response.pipe(file);
    Parsing();
  });
  console.log(req.body);
  var FinalJson = fs.readFileSync("./json/Final.json", 'utf8');
  var data = iconv.encode(iconv.decode(FinalJson, "windows-1251"), "utf-8").toString(); //декодировали для отображения кириллицы вместо крокозябр
  res.end(data);
});

app.listen(8080);
console.log('Сервер стартовал!');


////////////////////////////////////////////////////////////////////////////
function Parsing() {
  var ListOfPars = [];//список пар
  let listOfGroupIds = [];//список всех найденых id групп 
  var buffGroupsList = [];//буферный список
  var GroupsFromCist = fs.readFileSync("./json/groups_writed.json", 'utf8');
  GroupsFromCist = JSON.parse(GroupsFromCist);

  MyFunc.getObjectValue(GroupsFromCist, 'groups', buffGroupsList);//получаем все группы вместе с их id из общего файла хнурэ в список L[]

  for (let i = 0; i < buffGroupsList.length; i++) { // парсим каждый полученый объект и из него забираем все найденые группы
    buffGroupsList[i] = JSON.parse(buffGroupsList[i]);
    buffGroupsList[i].forEach(function (e) {
      listOfGroupIds.push(new constructors.groups(e.name, e.id));
    })
  }

  fs.writeFileSync('./json/groups_id.json', JSON.stringify(listOfGroupIds));//записываем в файл полный список групп 

  fs.readFile("csv/fileFromCist.csv", function (err, data) { //считали данные из файла, полученого от запроса
    if (err) throw err;
    data = iconv.encode(iconv.decode(data, "windows-1251"), "utf-8").toString(); //декодировали для отображения кириллицы вместо крокозябр
    data = data.replace(/"+/g, ''); //убираем все кавычки в строке 
    data = JSON.stringify(data);//преобразуем в строку json

    while (data.indexOf('r') !== -1) {
      let index = data.indexOf('r');//определяем индекс "r" в строке
      let str = data.substr(1, index);//определяем нужную строку 
      data = data.replace(str, '');//удаляем найденую строку из общей строки 
      str = str.substr(0, index - 2);//избавляемся от \r в строке

      if (data.length < 4) { // выходим из цикла, если остается пустая строка (data = '""')
        break;
      }

      var strlist = [];//массив строк (позже будет использован для объекта списка)
      for (let counter = 0; counter < 5; counter++) { //берем первые 5 параметров строки для объекта
        if (counter == 0) {
          let index = 0;
          if (data.charAt(data.indexOf('.') - 1) == "У") {
            index = data.indexOf(".", data.indexOf("У") + 2);
          } else {
            index = data.indexOf('.');
          }
          str = data.substr(1, index - 3);//определяем нужную строку
          data = data.replace(str, '');//удаляем найденую строку из общей строки 
        } else {
          let index = data.indexOf(',');//определяем индекс "," в строке
          str = data.substr(1, index);//определяем нужную строку
          data = data.replace(str, '');//удаляем найденую строку из общей строки 
        }
        if (str.length == 2 || str == "(1)") { //если длина строки равна 2 символа, прибавляем ее к предыдущей
          let str2 = str;
          str = str2.charAt(1);
          str += str2.charAt(0);
          strlist[counter - 1] += str;
          counter--;
        } else {
          if (str.includes(',')) {
            let index = str.lastIndexOf(',');//определяем индекс "," в строке
            str = str.substr(0, index);//избавляемся от "," в строке
            strlist.push(str);
          } else {
            strlist.push(str);
          }
        }
      }
      ListOfPars.push(new constructors.Para(strlist[0], strlist[1].replace(/(\d+).(\d+).(\d+)/, '$2/$1/$3'), strlist[2], strlist[3], strlist[4], strlist[1].replace(/(\d+).(\d+).(\d+)/, '$2/$1/$3') + ' ' + strlist[2]));
      //создаем новый объект в списке ListOfPars файла write.json
      //и заполняем его свойства
      //strlist[1].replace(/(\d+).(\d+).(\d+)/, '$2/$1/$3')+ ' ' + strlist[2]  (преобразовываем дату в ММ/ДД/ГГ ЧЧ:ММ:СС)
      //}
    }

    ListOfPars.sort(function (a, b) { // сортируем список по дате 
      return new Date(a.date) - new Date(b.date);
    });

    ListOfPars.forEach(function (e) { //присваивание id всем группам в ListOfPars из файла write.json
      for (let i = 0; i < e.group.length; i++) {
        let checkNameBuff = listOfGroupIds.some(element => element.name === e.group[i].group_name);//проверка есть ли в списке объект с таким полем
        if (!(checkNameBuff)) {
          listOfGroupIds.push(new constructors.groups(e.group[i].group_name, listOfGroupIds[listOfGroupIds.length - 1].id + 1));
          let index = listOfGroupIds.findIndex(x => x.name === e.group[i].group_name);
          e.group[i].group_id = listOfGroupIds[index].id;
        } else {
          let index = listOfGroupIds.findIndex(x => x.name === e.group[i].group_name);
          e.group[i].group_id = listOfGroupIds[index].id;
        }
      }
    });

    function FinalJSON() {//конструктор окончательного файла расписания
      var groupslist = [];
      var ListOfEvents = [];
      var hours_List = [];
      var ListOfSubjectIds = fs.readFileSync("./json/Subject_id.json", 'utf8');
      ListOfSubjectIds = JSON.parse(ListOfSubjectIds);// список id предметов, взятый из файла Subject_id.json

      ListOfPars.forEach(function (e, i) {// формируем список групп для каждой пары 
        var list = [];
        e.group.forEach(function (e1) {// пушим все группы одной пары в список для Final.json
          if (e1.group_name == "GUID") {
            list.push(0000);
          } else {
            list.push(e1.group_id);
          }

        });
        e.group.forEach(function (el1) { // пушим каждую задействованную группу в общий список групп
          if (el1.group == "GUID") {
            grouplist.push("GUID", 0000);
          } else {
            groupslist.push(new constructors.groups(el1.group_name, el1.group_id));
          }
        });
        var typeOfPar = 0;
        for (let k = 0; k < constructors.types.length; k++) { // заполняем поле type списка events в Final.json 
          if (e.kind == constructors.types[k].short_name) {
            typeOfPar = constructors.types[k].id;
            break;
          }
        }//

        ListOfEvents.push(new constructors.events(0, Date.parse(e.date) / 1000, ((Date.parse(e.date) / 1000) + 5700), typeOfPar, e.para, e.cabinet, list));
      });
      groupslist.sort(function (a, b) {// сортируем список всех задействованных групп по id
        return a.id - b.id;
      });
      for (let i = groupslist.length - 1; i > 0; i--) { // удаляем одинаковые группы из списка
        if (groupslist[i].id == groupslist[i - 1].id) {
          groupslist.splice(groupslist.indexOf(groupslist[i]), 1);
        }
      }
      var buffList = [];//список для задействованых id 

      for (let i = 0; i < ListOfPars.length; i++) {
        let checkNameBuff = buffList.some(element => element.brief === ListOfPars[i].subject);//проверка есть ли в списке объект с таким полем
        let checkNameList = ListOfSubjectIds.some(element => element.brief === ListOfPars[i].subject);//проверка есть ли в файле объект с таким полем
        if (!(checkNameBuff)) {
          buffList.push(new constructors.BuffList(buffList.length + 1, ListOfPars[i].subject));
          let index = buffList.findIndex(x => x.brief === ListOfPars[i].subject);
          ListOfEvents[i].subject_id = buffList[index].id;
          if (!(checkNameList)) {
            ListOfSubjectIds.push(new constructors.subjectIDS(ListOfSubjectIds.length + 1, ListOfPars[i].subject));
          }
        }
        else {
          let index = buffList.findIndex(x => x.brief === ListOfPars[i].subject);
          ListOfEvents[i].subject_id = buffList[index].id;
        }
      }
      for (let i = 0; i < ListOfEvents.length; i++) {//заносим все типы пар в список
        hours_List.push(new constructors.hours(ListOfEvents[i].type, 0));
      }
      hours_List.sort(function (a, b) {
        return a.type - b.type;
      });
      for (let i = hours_List.length - 1; i > 0; i--) { //фильтруем на уникальность
        if (hours_List[i].type == hours_List[i - 1].type) {
          hours_List.splice(hours_List.indexOf(hours_List[i]), 1);
        }
      }
      buffList.sort(function (a, b) { //сортируем список использованных id предметов по id
        return a.id - b.id;
      });
      var Subject_List = [];//список subjects Final.json
      buffList.forEach(function (e) {
        Subject_List.push(new constructors.subjects(e.id, e.brief, e.brief, hours_List));
      });
      this.time_zone = "Europe/Kiev";
      this.events = ListOfEvents;
      this.groups = groupslist;
      this.teachers = [];
      this.subjects = Subject_List;
      this.types = constructors.types;
    }

    var Final = new FinalJSON();// создание финального объекта файла Final.json
    fs.writeFile("./json/Final.json", JSON.stringify(Final), function (error) { //записываем данные в файл
      if (error) throw error;
      console.log("Файл успешно записан");  // уведомление о завершении
    });
    fs.writeFile("./json/write.json", JSON.stringify(ListOfPars, null, 4), function (error) { //записываем данные в файл
      if (error) throw error;
      console.log("Файл успешно записан");  // уведомление о завершении
    });
  });
}