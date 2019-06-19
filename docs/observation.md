# Наблюдение

Этот документ будет содержать структурное и функциональное описание данной сущности.

## Cтруктура

| Поле                  | Тип                   | Значение                                           | Дефолт | Req. | EURING | Eng | Rus | Bel |
| --------------------- | --------------------- | -------------------------------------------------- | ------ | ---- | ------ | --- | --- | --- |
| id                    | string                | UUID                                               |        |      |        |     |     |     |
| ring                  | Ring                  | ссылка на кольцо                                   |        |      |        |     |     |     |
| ringMentioned         | string                | кольцо по наблюдателю                              |        |      |        |     |     |     |
| finder                | User                  | ссылка на пользователя                             |        |      |        |     |     |     |
| photos                | string[], null        | фотос                                              |        |      |        |     |     |     |
| speciesMentioned      | Species               | вид птицы по наблюдателю                           |        |      |        |     |     |     |
| speciesConcluded      | Species               | подтвержденный вид птицы                           |        |      |        |     |     |     |
| sexMentioned          | Sex                   | пол птицы по наблюдателю                           |        |      |        |     |     |     |
| sexConcluded          | Sex                   | подтвержденный пол птицы                           |        |      |        |     |     |     |
| ageMentioned          | Age                   | возраст птицы по наблюдателю                       |        |      |        |     |     |     |
| ageConcluded          | Age                   | подтвержденный возраст птицы                       |        |      |        |     |     |     |
| distance              | number, null          | расстояние от места кольцевания, в км.             |        |      |        |     |     |     |
| direction             | number, null          | направление от места кольцевания, в град.          |        |      |        |     |     |     |
| elapsedTime           | number, null          | время прошедшее с момента кольцевания в днях       |        |      |        |     |     |     |
| colorRing             | string, null          | это поле используется в Access для остальных меток |        |      |        |     |     |     |
| manipulated           | Manipulated           | действия совершавшиеся при наблюдении              |        |      |        |     |     |     |
| movedBeforeTheCapture | MovedBeforeTheCapture | практически то же самое (todo)                     |        |      |        |     |     |     |
| catchingMethod        | CatchingMethod        | Метод поимки                                       |        |      |        |     |     |     |
| catchingLures         | CatchingLures         | Приспособления для поимки                          |        |      |        |     |     |     |
| date                  | Date, null            | Дата наблюдения                                    |        |      |        |     |     |     |
| accuracyOfDate        | AccuracyOfDate        | Точность этой даты                                 |        |      |        |     |     |     |
| latitude              | number, null          | Широта                                             |        |      |        |     |     |     |
| longitude             | number, null          | Долгота                                            |        |      |        |     |     |     |
| accuracyOfCoordinates | AccuracyOfCoordinates | Точность этих координат                            |        |      |        |     |     |     |
| status                | Status                | Статус                                             |        |      |        |     |     |     |
| pullusAge             | PullusAge             | возраст птенца                                     |        |      |        |     |     |     |
| accuracyOfPullusAge   | AccuracyOfPullusAge   | точность этого возраста                            |        |      |        |     |     |     |
| condition             | Condition             | условия при которых произошло наблюдение (поимка)  |        |      |        |     |     |     |
| circumstances         | Circumstances         | Обстоятельства                                     |        |      |        |     |     |     |
| circumstancesPresumed | CircumstancesPresumed | Достоверность обстоятельств                        |        |      |        |     |     |     |
| placeName             | string, null          | Место наблюдения                                   |        |      |        |     |     |     |
| placeCode             | PlaceCode             | Место наблюдения по коду                           |        |      |        |     |     |     |
| remarks               | string, null          | Пометки                                            |        |      |        |     |     |     |
| verified              | boolean               | Статус данного наблюдения для его процессинга      |        |      |        |     |     |     |
