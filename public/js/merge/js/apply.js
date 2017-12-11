$(document).ready(function () {

    var all_depart;
    var form_option = {};
    var _user = JSON.parse(localStorage.getItem('user'));
    var is_kq = null;
    var _val = $('input[name="order"]:checked').val();

    console.log(_user)
    if (_user.user) {
        form_option.uid = _user.user.id;
        form_option.role = _user.user.role;
        if (_user.user.role == "科所队领导") {
            get_carData(_user.depart.id, 1)
            $('#borrow').parent().hide();
            $('#night').hide();
            $('#auditer').show();
            $('#car_driver').show();
        } else if (_user.user.role == '局领导') {
            $('#borrow').parent().hide();
            $('#night').hide();
            $('#auditer').hide();
            form_option.driver = 3
        } else {
            $('#borrow').parent().show();
            $('#night').show();
            $('#auditer').show();
        }
    }





    form_option.night = _val;
    _user.depart ? form_option.depart = _user.depart.id : null;

    function getJson(url, callback, option, type) {
        var types = type ? type : 'get';
        var option = Object.assign({}, option ? option : {})
        $.ajax({
            url: url,
            dataType: 'json',
            data: option,
            timeout: 10000,
            type: types,
            success: callback,
            error: function (err) { },
        })
    }

    getJson('./get_depart', all_depart)
    getJson('./address', address)
    var car_data = [];
    function get_carData(depart, is_kl) {
        getJson('./get_car', get_car, { depart: depart })
        function get_car(res) {
            console.log(res, 'car')
            car_data = [];
            var user_car = [];
            res.forEach((ele, index) => {
                var op = {};
                ele.name ? op.label = ele.cname + '(' + ele.name + ele.mobile + ')' : op.label = ele.cname;
                op.value = ele.cid;
                car_data.push(op);
                !ele.name ? user_car.push(ele) : null
            })
            is_kl ? !user_car.length ? weui.alert('本部门没有可使用车辆,由车队派车') : null : null;
            is_kl ? !user_car.length ? form_option.driver = 3 : null : null;
            is_kl ? !user_car.length ? $('#car_driver').hide() : null : null;
        }
    }

    $('#select_car').on('click', function () {
        car_data.length ?
            weui.picker(car_data, {
                onChange: function (result) {
                    console.log(result);
                },
                onConfirm: function (result) {
                    // console.log(result);
                    form_option.car_num = result[0].label;
                    $('#select_car .weui-cell__ft').text(result[0].label);
                    $('#select_car .weui-cell__ft').css({ color: '#000' });
                },
                id: 'select_car'
            })
            :
            weui.alert('没有车辆选择')
            ;
    });

    // 本部门
    function all_depart(res) {
        // console.log(res)
        all_depart = res;
        var depart_data = [];
        res.forEach((ele, index) => {
            var op = {};
            op.label = ele.name;
            op.value = ele.id;
            depart_data.push(op);
        });
    }


    $('#borrow').on('click', function () {
        weui.picker([
            {
                label: '本单位车辆',
                value: '1'
            }, {
                label: '向其他单位借车',
                value: '2'
            }, {
                label: '向车队申请派车',
                value: '3'
            }
        ], {
                defaultValue: ['1'],
                onChange: function (result) {
                    // console.log(result);
                },
                onConfirm: function (result) {
                    // console.log(result);
                    // form_option.borrow = result[0];
                    var _v = result[0].value;
                    form_option.driver = _v;
                    $("#driver").val("")
                    delete_depart();
                    delete_car();
                    if (_v == 3) {
                        $('#car_driver').hide();
                        $('#borrow_depart1').hide();
                    } else {
                        _v == 1 ? $('#car_driver').show() : $('#car_driver').hide();
                        _v == 2 ? $('#borrow_depart1').show() : $('#borrow_depart1').hide();
                        _v == 1 ? get_carData(_user.depart.id) : null;

                    }
                    $('#borrow .weui-cell__ft').text(result[0].label);
                    $('#borrow .weui-cell__ft').css({ color: '#000' });
                    _v == 2 ? b_depart() : null;
                },
                id: 'borrow'
            });
    });


    function delete_car() {
        delete form_option.car_num;
        $('#select_car .weui-cell__ft').text('请选择');
        $('#select_car .weui-cell__ft').css({ color: '#ccc' });
    }

    function delete_depart() {
        // delete form_option.car_num
        $('#borrow_depart .weui-cell__ft').text('请选择');
        $('#borrow_depart .weui-cell__ft').css({ color: '#ccc' });
    }


    //借车单位
    function b_depart() {
        $('#borrow_depart').on('click', function () {
            var depart_data = [];
            var _index = null;
            all_depart.forEach((ele, index) => {
                var op = {};
                if (ele.id != 1 && ele.id != form_option.depart) {
                    op.label = ele.name;
                    op.value = ele.id;
                    depart_data.push(op)
                }
            })
            _index = depart_data[0].value
            weui.picker(depart_data, {
                defaultValue: [_index],
                onChange: function (result) {

                },
                onConfirm: function (result) {
                    // form_option.depart = result[0].value;
                    delete_car();
                    get_carData(result[0].value);
                    $('#car_driver').show()
                    $('#borrow_depart .weui-cell__ft').text(result[0].label);
                    $('#borrow_depart .weui-cell__ft').css({ color: '#000' });
                    console.log(result, form_option)
                },
                id: 'borrow_depart'
            });
        });
    }

    //地址
    function address(res) {
        console.log(res, 'res')
        var addr_data = [];
        var provi = [];
        var city = [];
        var addr = [];

        res.forEach((ele, index) => {
            var op = {}
            if (ele.level == 1) {
                op.label = ele.areaName;
                op.value = ele.id;
                provi.push(op);
                addr_data.push(op);
            } else if (ele.level == 2) {
                op.label = ele.areaName;
                op.value = ele.id;
                op.p = ele.parentId
                city.push(op);
            } else {
                op.label = ele.areaName;
                op.value = ele.id;
                op.p = ele.parentId;
                addr.push(op);
            }
        })

        city.forEach((ele, index) => {
            ele.children = [];
            addr.forEach((e, i) => {
                if (ele.value == e.p) {
                    delete e.p;
                    ele.children.push(e);
                }

            })
        })
        provi.forEach((ele, index) => {
            ele.children = [];
            city.forEach((e, i) => {
                if (ele.value == e.p) {
                    delete e.p;
                    ele.children.push(e);
                }
            })
        })
        console.log(provi, city, addr)
        // console.log(addr_data,'addr')
        $('#address').on('click', function () {
            weui.picker(provi, {
                depth: 3,
                defaultValue: [11, 177, 2164],
                onChange: function onChange(result) {
                    console.log(result);
                },
                onConfirm: function onConfirm(result) {
                    // console.log(result);
                    result[1].label == '温州市' ? is_kq = false : is_kq = true;
                    getAudit()
                    var text = result.reduce(function (pre, current) {
                        return pre.label ? pre.label + current.label : pre + current.label
                    })
                    form_option.province = text;
                    // console.log(text)
                    $('#address .weui-cell__ft').text(text);
                    $('#address .weui-cell__ft').css({ color: '#000' });
                    console.log(is_kq)

                },
                id: 'address'
            });
        });

    }

    function getAuditer() {


    }


    // localStorage.setItem('user', JSON.stringify({ df: 1 }))
    $('#audit_user').on('click', function () {
        $('#container').hide();
        $('#audit_list').show();
        var state = { 'page_id': 1, 'user_id': 5 };
        var title = '选择审核人';
        var url = 'book';
        history.pushState(state, title, url);
        window.addEventListener('popstate', function (e) {
            // console.log(e);
            $('#container').show();
            $('#audit_list').hide();
        });
    })





    // var $submit_unsuccess = $('#submit_unsuccess');
    // $('#toastBtn').on('click', function () {
    //     if ($submit_unsuccess.css('display') != 'none') return;
    //     $submit_unsuccess.fadeIn(100);
    //     setTimeout(function () {
    //         $submit_unsuccess.fadeOut(100);
    //     }, 3000);
    // });
    // console.log(1)



    var use_reason = ['执法办案', '社会面管理', '重大勤务', '督察检查', '指挥通信', '现场勘查', '押解', '勤务保障', '其他执法执勤']
    var op_arr = [];
    for (var i = 0; i < use_reason.length; i++) {
        var op_i = {};
        op_i.label = use_reason[i];
        op_i.value = i + 1;
        op_arr.push(op_i);
    }
    console.log(op_arr)
    $('#reason').on('click', function () {
        weui.picker(op_arr, {
            defaultValue: ['1'],
            onChange: function (result) {
                console.log(result);
            },
            onConfirm: function (result) {
                // console.log(result);
                form_option.days = result[0].label;
                var text = result[0].label;
                $('#reason .weui-cell__ft').text(text);
                $('#reason .weui-cell__ft').css({ color: '#000' })
            },
            id: 'reason'
        });
    });

    $('#user').on('change', function (e) {
        // console.log(e.target.value)
        form_option.name = e.target.value;
    })
    $('#peer').on('change', function (e) {
        form_option.peer = e.target.value;
    })
    $('#driver').on('change', function (e) {
        form_option.driver = e.target.value;
    })
    $('#deta_addr').on('change', function (e) {
        form_option.address = e.target.value;
    })

    // console.log(_val)
    $('input[name="order"]').on('click', function (e) {
        form_option.night = e.target.value;
        getAudit()
        console.log(form_option);
    });



    function getAudit() {
        var op = {};
        op.depart = _user.depart.id;
        if (_user.user) {
            if (_user.user.role == "科所队领导") {
                getJson('/getaudit', showaudit, op);
            } else if (_user.user.role == '局领导') {

            } else {
                if (form_option.night == 1 || is_kq) {
                    op.jwdepart = 10;
                    op.judepart = 1;
                }
                getJson('/getaudit', showaudit, op);
            }
        }
    }
    function show_auditer(data) {
        $('#add_auditer').empty();
        data.forEach((ele, index) => {
            if (ele) {
                var str = 'show_i' + index
                var tr_content = `<div class="weui-cell__hd weui-flex" style="position: relative;" >
                    <img src="./js/merge/img/1.png" class="" style="height:50px;width: 50px;display: block">
                    <span class="" style="position: absolute;top:-12px;right: 17px;" id="` + str + `">
                    <i class="weui-icon-cancel icon-delete"></i>
                    </span>
                    <span class="l_h_40 elli">...</span>
                    <span class="addr_book">` + ele.name + `</span>
                    </div>`
                $('#add_auditer').append(tr_content);
                var ff = '#' + str
                $(ff).on('click', function (res) {
                    // select_auditer(ele)
                    // console.log(index)
                    apend_data[index] = null;
                    show_auditer(apend_data);
                })
            }

        })
    }
    var apend_data = [];
    function showaudit(res) {
        console.log(res, 'res')
        var auditer = res.filter(ele => { return ele.role == '科所队领导' || ele.role == '局领导' || ele.role == '警务保障室领导' })
        console.log(auditer)
        var k_l = res.filter(ele => { return ele.role == '科所队领导' })
        var j_l = res.filter(ele => { return ele.role == '警务保障室领导' });
        var ju_l = res.filter(ele => { return ele.role == '局领导' });
        apend_data = [k_l[0], j_l[0], ju_l[0]];
        // $('#add_auditer').empty();
        show_auditer(apend_data)

        $('#audit_list').empty();
        if (ju_l.length) {
            ju_l.forEach((ele, index) => {
                var str = 'ju_l' + index
                var tr_content = `<div class="weui-cell weui-cell_access" id="` + str + `">
                <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                    <img src="./js/merge/img/1.png" style="width: 50px;display: block">
                </div>
                <div class="weui-cell__bd">
                    <p>`+ ele.name + `</p>
                    <p style="font-size: 13px;color: #888888;">`+ ele.role + `</p>
                </div>
            </div>`
                $('#audit_list').append(tr_content);
                var ff = '#' + str
                $(ff).on('click', function (res) {
                    select_auditer(ele)
                })
            })
        }
        if (j_l.length) {
            j_l.forEach((ele, index) => {
                var str = 'j_l' + index
                var tr_content = `<div class="weui-cell weui-cell_access" id="` + str + `">
                    <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                        <img src="./js/merge/img/1.png" style="width: 50px;display: block">
                    </div>
                    <div class="weui-cell__bd">
                        <p>`+ ele.name + `</p>
                        <p style="font-size: 13px;color: #888888;">`+ ele.role + `</p>
                    </div>
                </div>`
                $('#audit_list').append(tr_content);
                var ff = '#' + str
                $(ff).on('click', function (res) {
                    select_auditer(ele)
                })
            })
        }
        if (k_l.length) {
            k_l.forEach((ele, index) => {
                var str = 'k_l' + index
                var tr_content = `<div class="weui-cell weui-cell_access" id="` + str + `">
                <div class="weui-cell__hd" style="position: relative;margin-right: 10px;">
                    <img src="./js/merge/img/1.png" style="width: 50px;display: block">
                </div>
                <div class="weui-cell__bd">
                    <p>`+ ele.name + `</p>
                    <p style="font-size: 13px;color: #888888;">`+ ele.role + `</p>
                </div>
            </div>`

                $('#audit_list').append(tr_content);
                var ff = '#' + str
                $(ff).on('click', function (res) {
                    // console.log(ele, index, 'ddd')
                    select_auditer(ele)
                })
            })

        }
    }

    function select_auditer(data) {
        if (data.role == '局领导') {
            apend_data[2] = data
        } else if (data.role == '警务保障室领导') {
            apend_data[1] = data
        } else {
            apend_data[0] = data;
        }
        history.back();
        show_auditer(apend_data);
    }





    // var $submit_success = $('#submit_success');
    $('#toastBtn').on('click', function () {
        // console.log(form_option)
        var data = [];
        var str = [];
        // form_option.auditer = apend_data;
        form_option.id = 0;
        form_option.cre_tm = ~~(new Date().getTime() / 1000);
        // console.log(form_option);

        // for (var o in form_option) {
        //     // str += o + ','
        //     str.push(o)
        //     data.push(form_option[o])
        // }
        if (!form_option.name) {
            weui.alert('请输入使用人');
            return;
        }
        if (!form_option.province) {
            weui.alert('请选择地址');
            return;
        }
        if (!form_option.days) {
            weui.alert('请选择事由');
            return;
        }
        if (_user.user) {
            if (_user.user.role == "科所队领导") {
                if (!apend_data[0]) {
                    weui.alert('请选择审核人')
                } else {
                    form_option.status = 1;
                    form_option.estatus = 1;
                }
            } else if (_user.user.role == '局领导') {

            } else {
                if (!form_option.driver) {
                    weui.alert('请选择用车')
                } else {

                    if (!form_option.car_num && form_option.driver != 3) {
                        weui.alert('请选择车辆');
                        return;
                    }
                }
                if (form_option.driver == 1 || form_option.driver == 2) {
                    if (!form_option.car_num) {
                        weui.alert('请选择车辆');
                        return;
                    }
                    weui.alert('请输入驾驶人');
                    return;
                } else {
                    // if (form_option.driver.length > 1) {
                    //     weui.alert('请输入驾驶人');
                    //     return;
                    // }
                }

            }
            // var 
            if (form_option.night > 0 || is_kq) {
                var is_ok = false
                apend_data.forEach((ele, index) => {
                    if (!ele && index == 0) {
                        weui.alert('请选择科所队领导');
                        is_ok = true;
                        return;
                    } else if (!ele && index == 1) {
                        weui.alert('请选择警务保障室领导');
                        is_ok = true;
                        return;
                    } else if (!ele && index == 2) {
                        weui.alert('请选择局领导');
                        is_ok = true;
                        return;
                    } else {
                        form_option.status = 3;
                        form_option.estatus = 3;
                    }
                })
                if (is_ok) {
                    return;
                }
                // if (apend_data.length != 3) {
                //     weui.alert('该申请为三级审批，请选择科所队领导、警务保障室领导和局领导')
                // } else {

                // }
            } else {
                if (_user.user.role != '局领导') {
                    if (!apend_data[0]) {
                        weui.alert('请选择审核人');
                        return;

                    } else {
                        form_option.status = 1;
                        form_option.estatus = 1;
                    }
                }

            }
        }



        var push_op = {
            form_option: form_option,
            auditer: apend_data
        }

        console.log(str)

        getJson('/add_apply', function (res) {
            console.log(res)
            weui.alert('提交成功', function () {
                sendmessage(res, apend_data[0].userid, _user.user.name)
                
            });
        }, push_op)



    });
    // function sendmessage(id, userid, t) {
    //     var titles = t || '用车申请'
    //     str = 'http://jct.chease.cn' + '/my_list?applyid=' + id
    //     var url = 'http://h5.bibibaba.cn/send_qywx.php?touser=' + userid
    //         + '&toparty=&totag=&'
    //         + 'title=' + titles + '&'
    //         + 'desc=' + _user.user.name + '的用车&'
    //         + 'url=' + str + '&remark=查看详情'
    //     // if (res.spstatus[0]) {
    //     W.ajax(url, {
    //         dataType: 'json',
    //         success: function (res) {
    //             // console.log(res)
    //             // weui.alert('已催办')
    //             history.back()
    //         }
    //     })
    //     // }
    // }
    function sendmessage(id, userid, name, ti, alt) {
        var titles = ti || '用车申请'
        var str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
        var _desc = name + '的用车'
        var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
        $.ajax({
            url: 'http://h5.bibibaba.cn/send_qywx.php',
            data: _op_data,
            dataType: 'jsonp',
            crossDomain: true,
            success: function (re) {
                // if (alt) {
                //     weui.alert(alt, function () {
                //         history.go(0);
                //     })
                // } else {
                //     history.go(0);
                // }
                top.location = '/usecar_detail?applyid=' + id + '&my=true'
            },
            error: function (err) {
                // console.log(err)
                // if (alt) {
                //     weui.alert(alt, function () {
                //         history.go(0);
                //     })
                // } else {
                //     history.go(0);
                // }
                top.location = '/usecar_detail?applyid=' + id + '&my=true'
            }
        })
    }
    console.log(window.parent.location,'parent')
});