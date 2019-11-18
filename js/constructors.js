
module.exports.Para = function (theme, start_date, start_time, end_date, end_time, date) { //объект пары для файла write.json
    this.theme = theme;
    this.start_date = start_date;
    this.start_time = start_time;
    this.end_date = end_date;
    this.end_time = end_time;
    this.date = date;
    group = function (group_id, group_name) { //конструктор групп для списка
        this.group_id = group_id;
        this.group_name = group_name;
    }
    switch (start_time) {
        case "07:45:00":
            var para = 1;
            break;
        case "09:30:00":
            var para = 2;
            break;
        case "11:15:00":
            var para = 3;
            break;
        case "13:10:00":
            var para = 4;
            break;
        case "14:55:00":
            var para = 5;
            break;
        case "16:40:00":
            var para = 6;
            break;
        case "18:25:00":
            var para = 7;
            break;
        default:
            var para = 8;
            break;
    };
    this.para = para;
    let arrstr = theme.split(' '); //получить отдельные аттрибуты строки theme

    if (arrstr.length < 4) {
        groupslist = [];
        groupslist.push(new group(0, "GIUD"));//Group Is Un Defined(нету группы)
        this.group = groupslist;
        this.subject = arrstr[0];
        this.kind = arrstr[1];
        this.cabinet = arrstr[2];
    } else {
        groupslist = [];
        let s = arrstr[3];
        if (arrstr[3].includes(',')) { //КІУКІ-17-1,2,3,4,5
            if (arrstr[3].includes(';')) {
                this.subject = arrstr[0];
                this.kind = arrstr[1];
                this.cabinet = arrstr[2];
                this.group = groupslist;
                groupslist.push(new group(0, arrstr[3]));
            } else {
                let desc = s.substr(0, s.lastIndexOf('-') + 1);
                s = s.replace(desc, '');
                while (s !== "") {
                    let numofgroup = "";
                    if (s.length == 1) {
                        numofgroup = desc + s;
                        s = "";
                    } else {
                        numofgroup = s.substr(0, s.indexOf(',') + 1);
                        s = s.replace(numofgroup, '');
                        numofgroup = desc + numofgroup.substr(0, numofgroup.indexOf(','));
                    }
                    groupslist.push(new group(0, numofgroup));
                }
                this.subject = arrstr[0];
                this.kind = arrstr[1];
                this.cabinet = arrstr[2];
            }
            this.group = groupslist;
        } else if (arrstr[3].includes(';')) {//КІУКІу-18-1;КІУКІу-18-2
            if (s.includes("*")) {
                this.group = groupslist;
                this.subject = arrstr[0];
                this.kind = arrstr[1];
                this.cabinet = arrstr[2];
                if (s !== ' ') {
                    for (let i = 7; i < arrstr.length; i++) {
                        s += arrstr[i];
                    }
                }
                s = s + ';';
                while (s.indexOf(';') !== -1) {
                    let index = s.indexOf(';');
                    let numofgroup = s.substr(0, index + 1);
                    s = s.replace(numofgroup, '');
                    numofgroup = numofgroup.substr(0, numofgroup.indexOf(';'));
                    groupslist.push(new group(0, numofgroup));
                }

            } else {
                s = s + ';';
                while (s.indexOf(';') !== -1) {

                    let index = s.indexOf(';');
                    let numofgroup = s.substr(0, index + 1);
                    s = s.replace(numofgroup, '');
                    numofgroup = numofgroup.substr(0, numofgroup.indexOf(';'));
                    groupslist.push(new group(0, numofgroup));
                }
                this.group = groupslist;
                this.subject = arrstr[0];
                this.kind = arrstr[1];
                this.cabinet = arrstr[2];
            }
        } else {
            groupslist.push(new group(0, arrstr[3]));
            this.group = groupslist;
            this.subject = arrstr[0];
            this.kind = arrstr[1];
            this.cabinet = arrstr[2];
        }
    }
}


module.exports.types = [ //список типов всех пар
    { "id": 0, "short_name": "Лк", "full_name": "Лекція", "id_base": 0, "type": "lecture" },
    { "id": 1, "short_name": "У.Лк (1)", "full_name": "Уст. Лекція (1)", "id_base": 0, "type": "lecture" },
    { "id": 2, "short_name": "У.Лк", "full_name": "Уст. Лекція", "id_base": 0, "type": "lecture" },
    { "id": 10, "short_name": "Пз", "full_name": "Практичне заняття", "id_base": 10, "type": "practice" },
    { "id": 12, "short_name": "У.Пз", "full_name": "Уст. Практичне заняття", "id_base": 10, "type": "practice" },
    { "id": 20, "short_name": "Лб", "full_name": "Лабораторна робота", "id_base": 20, "type": "laboratory" },
    { "id": 21, "short_name": "Лб", "full_name": "Лабораторна ІОЦ", "id_base": 20, "type": "laboratory" },
    { "id": 22, "short_name": "Лб", "full_name": "Лабораторна кафедри", "id_base": 20, "type": "laboratory" },
    { "id": 23, "short_name": "У.Лб", "full_name": "Уст. Лабораторна ІОЦ", "id_base": 20, "type": "laboratory" },
    { "id": 24, "short_name": "У.Лб", "full_name": "Уст. Лабораторна кафедри", "id_base": 20, "type": "laboratory" },
    { "id": 30, "short_name": "Конс", "full_name": "Консультація", "id_base": 30, "type": "consultation" },
    { "id": 40, "short_name": "Зал", "full_name": "Залік", "id_base": 40, "type": "test" },
    { "id": 41, "short_name": "дзал", "full_name": "ЗалікД", "id_base": 40, "type": "test" },
    { "id": 50, "short_name": "Екз", "full_name": "Екзамен", "id_base": 50, "type": "exam" },
    { "id": 51, "short_name": "ЕкзП", "full_name": "ЕкзаменП", "id_base": 50, "type": "exam" },
    { "id": 52, "short_name": "ЕкзУ", "full_name": "ЕкзаменУ", "id_base": 50, "type": "exam" },
    { "id": 53, "short_name": "ІспКомб", "full_name": "Іспит комбінований", "id_base": 50, "type": "exam" },
    { "id": 54, "short_name": "ІспТест", "full_name": "Іспит тестовий", "id_base": 50, "type": "exam" },
    { "id": 55, "short_name": "мод", "full_name": "Модуль", "id_base": 50, "type": "exam" },
    { "id": 60, "short_name": "КП/КР", "full_name": "КП/КР", "id_base": 60, "type": "course_work" }
];

module.exports.BuffList = function (id, brief) { //конструктор используемых предметов и их id
    this.id = id;
    this.brief = brief;
}
module.exports.subjectIDS = function (id, brief) {//конструктор для файла с id предметов
    this.id = id;
    this.brief = brief;
}

module.exports.events = function (subject_id, start_time, end_time, type, number_pair, auditory, groups) {
    //конструктор событий для Final.json
    this.subject_id = subject_id;
    this.start_time = start_time;
    this.end_time = end_time;
    this.type = type;
    this.number_pair = number_pair;
    this.auditory = auditory;
    this.teachers = [];
    this.groups = groups;
}

module.exports.groups = function (name, id) {//конструктор для общего списка задействованых групп
    this.name = name;
    this.id = id;
}

module.exports.subjects = function (id, brief, title, hours_List) { //конструктор для списка задействованых предметов
    this.id = id;
    this.brief = brief;
    this.title = title;
    this.hours = hours_List;

}

module.exports.hours = function (type, val) { //конструктор часов определенного предмета в списке subjects 
    this.type = type;
    this.val = val;
    this.teachers = [];
}



