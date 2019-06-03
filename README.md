# Лабораторная работа №1
## Выбранная среда программирования
Работа написанная  на платформе Nodejs

[Файл](https://github.com/ArthurKa/WebAnalytics_lab_1/blob/master/logs/access_log) содержит логи за 6 дней - с 7.03.2004 по 12.03.2004.

## Описание аномалий

Поиск аномалий производился путем отслеживания количества операций в 30 секунд для каждого адреса.
По результатам исследования получено список [адресов](https://github.com/ArthurKa/WebAnalytics_lab_1/blob/master/top.txt) с количеством операций за 30 секунд, топ 5 из которых это

    [
     {"remoteHost": "10.0.0.153", "operationsPerInterval": 28},   
     {"remoteHost": "ts04-ip92.hevanet.com", "operationsPerInterval": 22}, 
     {"remoteHost": "h24-70-69-74.ca.shawcable.net", "operationsPerInterval": 21}, 
     {"remoteHost": "market-mail.panduit.com", "operationsPerInterval": 18}, 
     {"remoteHost": "ip68-228-43-49.tc.ph.cox.net", "operationsPerInterval": 18}
    ]

# Вывод
По полученным результатам эти пользователи могут скорее всего использовать инструменты автоматизации, для ботов слишком маленькая активность.
