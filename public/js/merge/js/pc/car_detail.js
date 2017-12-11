$(document).ready(function () {
    var _g = W.getSearch();
    _user = JSON.parse(localStorage.getItem('user'))
    function getApply() {
        W.ajax('/getapply_list', {
            data: { applyid: _g.applyid },
            success: function (res) {
                console.log(res, _user, 'dd')
                show_apply(res)
            }
        })
    }
    getApply();

    function show_apply(data) {
        // console.log(data);
        var apply = data.apply[0];
        apply.car_num ? $('#cl').text(apply.car_num) : '';
        apply.driver == 3 ? '' : $('#jsy').text(apply.driver)
        $('#days').text(apply.days)
        $('#peer').text(apply.peer);
        $('#sqr').text(apply.aname);
        $('#sqsj').text(W.dateToString(new Date((apply.acre_tm * 1000))));
        $('#sqbm').text(apply.name);
        $('#night').text(apply.night ? '是' : '否');
        $('#dz').text(apply.province);
        $('#address').text(apply.address);

        show_audit(data.spstatus);
        auditing(data)
    }

    function show_audit(data) {
        $('#auditer').empty();
        data.forEach((ele, index) => {
            var isagree = ''
            ele.isagree ? ele.isagree == 1 ? isagree = '同意' : isagree = '驳回' : isagree = '审核中'

            var tr_content = `<tr class="tr_b_b1">
            <th>${ele.role}审批</th>
            <th>${isagree}</th>
            <th>${ele.name} </th>
            <th>${ele.advice ? ele.advice : ''}</th>
            <th>${W.dateToString(new Date((ele.scre_tm * 1000)))}</th>
        </tr>`
            $('#auditer').append(tr_content)
        })
    }


    function auditing(res) {
        var _spstatus = [];
        var username = res.apply[0].aname;
        res.spstatus.forEach(ele => {
            if (ele.role == '科所队领导') {
                _spstatus[0] = ele
            } else if (ele.role == '警务保障室领导') {
                _spstatus[1] = ele
            } else if (ele.role == '局领导') {
                _spstatus[2] = ele
            } else if (ele.role == '管理员') {
                _spstatus[0] = ele
            }
        })
        res.spstatus = _spstatus;
        if (res.apply[0].etm) {
            $('#my_button').hide();
            $('#other_button').hide();
        }
        var _status = 0;
        var _sp_status = 0;
        res.apply.forEach((ele, index) => {
            // var _href = './my_list?applyid=' + ele.id + '&my=' + true;
            _status = 0;
            _sp_status = res.spstatus[0].sp_status;

            if (_sp_status == 0 || _sp_status == 4) {//已撤销
                if (_g.my) {
                    $('#print_button').show();
                }
            } else if (_sp_status == 1) { //审核中
                if (_g.my) {
                    $('#my_button').show();
                } else if (_g.auditing) {
                    $('#other_button').show();
                }
            } else if (_sp_status == 5) { //通过
                if (_g.my && res.cart) { //我还车
                    $('#back_car').show()
                } else if (_g.backing_car) { //车队还车
                    $('#back_carlist').show();
                } else if (_g.give_car && !res.cart) { //派车
                    $('#give_car').show();
                }
            } else if (_sp_status == 6) {
                if (_g.my) {
                    $('#print_button').show();
                }
            }
            //_sp_status = 0,1,4,5


            if (res.spstatus.length == 1) {
                if (res.spstatus[0].isagree == 1) {
                    _status = 1;
                    if (res.apply[0].etm) {
                        _status = 2;
                    }
                } else {
                    _status = 0;
                }
                if (res.spstatus[0].isagree == 2) {
                    _status = 3;
                }
                if (!res.spstatus[0].isagree && res.apply[0].etm > 0) {
                    _status = 4;
                }
                var _res = res;

                $('#agree').on('click', function () {
                    var d_op = {
                        id: res.spstatus[0].sid,
                        isagree: 1,
                        applyid: _g.applyid,
                        sp_status: 5,
                    }
                    // getJson('/agree_apply', function (res) {
                    //     // console.log(res)
                    //     // sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批通过');
                    //     history.go(0)
                    // }, d_op)

                    W.ajax('/agree_apply', {
                        data: d_op,
                        success: function (res) {
                            sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批通过');
                        }
                    })
                })
                $('#reject').on('click', function () {
                    var re_etm = ~~(new Date().getTime() / 1000);
                    var d_op = {
                        id: res.spstatus[0].sid,
                        isagree: 2,
                        applyid: _g.applyid,
                        sp_status: 4,
                        etm: re_etm
                    }
                    // getJson('./agree_apply', function (res) {
                    //     // console.log(res)
                    //     // sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批驳回');
                    //     history.go(0)
                    // }, d_op);
                    W.ajax('/agree_apply', {
                        data: d_op,
                        success: function (res) {
                            sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '审批驳回');
                        }
                    })
                })

            } else if (res.spstatus.length == 3) {
                if (res.spstatus[0].isagree == 1 && res.spstatus[1].isagree == 1 && res.spstatus[2].isagree == 1) {
                    _status = 1;
                    if (res.apply[0].etm) {
                        _status = 2;
                    }
                } else {
                    _status = 0;
                }
                if (res.spstatus[0].isagree == 2 || res.spstatus[1].isagree == 2 || res.spstatus[2].isagree == 2) {
                    _status = 3;
                }
                if ((!res.spstatus[0].isagree || !res.spstatus[1].isagree || !res.spstatus[2].isagree) && res.apply[0].etm > 0) {
                    _status = 4;
                }
                var _userid = null;
                var _sid = null;
                var d_op = {};
                if (!res.spstatus[0].isagree) {
                    _userid = res.spstatus[0].userid;
                    _sid = res.spstatus[0].sid
                } else if (!res.spstatus[1].isagree) {
                    _userid = res.spstatus[1].userid
                    _sid = res.spstatus[1].sid
                } else if (!res.spstatus[2].isagree) {
                    _userid = res.spstatus[2].userid
                    _sid = res.spstatus[2].sid;
                    d_op.sp_status = 5
                }
                // $('#urge').on('click', function () {
                //     // sendmessage(res.apply[0].aid, _userid, username, null, '已催办')
                // })


                $('#agree').on('click', function () {
                    // var etm = 
                    d_op.id = _sid;
                    d_op.isagree = 1;
                    d_op.applyid = _g.applyid;
                    var _senid = res.apply[0].aid
                    // getJson('./agree_apply', function (res) {
                    //     // console.log(res);
                    //     // history.go(0)
                    //     // if (_user.user.role != '局领导') {
                    //     // sendmessage(_senid, _userid, username)
                    //     // } else if (_user.user.role == '局领导') {
                    //     // sendmessage(_senid, res.apply[0].userid, username, '审批通过')
                    //     // history.back();
                    //     // }
                    // }, d_op)

                    W.ajax('/agree_apply', {
                        data: d_op,
                        success: function (res) {
                            if (_user.user.role != '局领导') {
                                sendmessage(_senid, _userid, username)
                            } else if (_user.user.role == '局领导') {
                                sendmessage(_senid, res.apply[0].userid, username, '审批通过')
                                history.back();
                            }
                        }
                    })
                })
                $('#reject').on('click', function () {
                    var _senid = res.apply[0].aid;
                    var re_etm = ~~(new Date().getTime() / 1000);

                    // getJson('./agree_apply', function (res) {
                    //     // console.log(res);
                    //     // sendmessage(_senid, res.apply[0].userid, username, '审批驳回')
                    //     // history.go(0)
                    // }, { id: _sid, isagree: 2, applyid: res.apply[0].aid, etm: re_etm, sp_status: 4 })

                    W.ajax('/agree_apply', {
                        data: { id: _sid, isagree: 2, applyid: res.apply[0].aid, etm: re_etm, sp_status: 4 },
                        success: function (res) {
                            // history.go(0)
                            sendmessage(_senid, res.apply[0].userid, username, '审批驳回')
                        }
                    })
                })

                if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导' || _user.user.role == '局领导') {
                    if (_user.user.role == '科所队领导' && res.spstatus[0].isagree) {
                        $('#other_button').hide();
                    } else if (_user.user.role == '警务保障室领导') {
                        if (!res.spstatus[0].isagree || res.spstatus[1].isagree) {
                            $('#other_button').hide();
                        }
                    } else if (_user.user.role == '局领导') {
                        if (!res.spstatus[0].isagree || !res.spstatus[1].isagree || res.spstatus[2].isagree) {
                            $('#other_button').hide();
                        }
                    }
                }
            }
            // var use_status = '';
            // var color_status = '';
            // _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
            // _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
            // var span_status = `<span class="weui-badge great ${color_status} chang_f12" style="margin-left: 5px;" id="_spstatus">${use_status}</span>`
            // $('#_spstatus_1').empty();
            // $('#_spstatus_1').append(span_status);
            // $('#_spstatus').addClass(color_status)
        })



        if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导' || _user.user.role == '局领导') {
            // if (_status == 1 || _status == 3) {
            //     $('#other_button').hide();
            // }
        } else {
            // if (_status == 0) {
            //     $('#my_button').show();
            // } else if (_status == 2) {
            //     $('#my_button').hide();
            // }
        }
        var pc_op = {};
        if (_status == 1) {
            // $('#my_button').hide();
            // $('#other_button').hide();
            if (res.apply[0].car_num) { //还车
                // $('#my_button').hide();
                // $('#other_button').hide();
                // if (res.cart[0].depart != '58' && _g.my) { //本单位和借车单位还车
                //     $('#back_car').show();
                // } else if (_g.my) {
                //     $('#carlist_back').show();
                // }
                // if (res.cart[0].depart == '58' && !_g.my) {
                //     $('#back_carlist').show();
                // }
            } else { //车队派车
                if (_user.user.role == '管理员') {
                    // $('#pcar_driver').show();
                    // $('#pcar_dd').show();
                    W.ajax('/getcar_driver', {
                        data: { depart: 58 },

                        success: function (res) {
                            console.log(res)
                            $('#select_car').empty();
                            $('#select_driver').empty();
                            res.car.forEach((ele) => {
                                var op = {};
                                if (ele.id) {
                                    op.label = ele.cname + ele.driver
                                } else {
                                    op.label = ele.cname;
                                }
                                op.value = ele.cid
                                var tr_content = `<option value=${op.label}>${op.label}</option>`;
                                $('#select_car').append(tr_content)
                            })
                            res.driver.forEach((ele) => {
                                var op = {};
                                if (ele.id) {
                                    op.label = ele.dname + ele.car_num
                                } else {
                                    op.label = ele.dname;
                                }
                                op.value = ele.did;
                                var tr_content = `<option value=${op.label}>${op.label}</option>`;
                                $('#select_driver').append(tr_content)
                            })

                            $('#select_car').on('change', function () {
                                // console.log($(this).children('option:selected').val());
                                pc_op.car = $(this).children('option:selected').val()
                            })
                            $('#select_driver').on('change', function () {
                                // console.log($(this).children('option:selected').val())
                                pc_op.driver = $(this).children('option:selected').val();
                            })

                        }
                    })
                }
            }
        }

        $('#pcar_dd').on('click', function () {
            if (!pc_op.driver) {
                weui.alert('请选择司机');
                return;
            }
            if (!pc_op.car) {
                weui.alert('车辆');
                return;
            }

            pc_op.id = res.apply[0].aid;
            W.ajax('/up_applypc', {
                data: pc_op,
                success: function (res) {
                    // console.log(res)
                    sendmessage(res.apply[0].aid, res.apply[0].userid, username, '车队已派车')
                }
            })
            // getJson('up_applypc', function (re) {
            //     // console.log(res)
            //     // sendmessage(res.apply[0].aid, res.apply[0].userid, username, '车队已派车')
            // }, { car: car, driver: driver, id: res.apply[0].aid })
        })


        var _res = res
        //撤销
        $('#backout').on('click', function () {
            var etm = ~~(new Date().getTime() / 1000);
            W.ajax('/up_apply', {
                data: { etm: etm, id: res.apply[0].aid, sp_status: 0 },
                success: function (res) {
                    // history.go(0)
                    sendmessage(_res.apply[0].aid, _user.user.userid, username, '撤销成功')
                }
            })
            // getJson('/up_apply', function (res) {
            //     console.log(res)
            //     // top.location
            //     // sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '撤销成功')
            //     history.go(0)
            // }, { etm: etm, id: res.apply[0].aid, sp_status: 0 })
        })
        //车队还车
        $('#back_carlist').on('click', function () {
            var etm = ~~(new Date().getTime() / 1000);
            W.ajax('/up_apply', {
                data: { etm: etm, id: res.apply[0].aid, sp_status: 6 },
                success: function (res) {
                    // history.go(0)
                    sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '还车成功')
                }
            })
            // getJson('/up_apply', function (res) {
            //     // sendmessage(_res.apply[0].aid, _res.apply[0].userid, username, '还车成功')
            //     history.go(0)
            // }, { etm: etm, id: res.apply[0].aid, sp_status: 6 })
        })
        //用于我还车
        $('#back_cars').on('click', function () {
            var etm = ~~(new Date().getTime() / 1000);
            W.ajax('/up_apply', {
                data: { etm: etm, id: res.apply[0].aid, sp_status: 6 },
                success: function (res) {
                    sendmessage(_res.apply[0].aid, _user.user.userid, username, '还车成功')
                }
            })
            // getJson('/up_apply', function (res) {
            //     // console.log(res)
            //     history.go(0)
            // }, { etm: etm, id: res.apply[0].aid, sp_status: 6 })
        })

        // $('#carlist_back').on('click', function () {
        //     // sendmessage(_res.apply[0].aid, '034237', username, '请还车', '已通知车队还车');
        // })
    }

    $('#goback').on('click', function () {
        history.back();
    })
    $('#print').on('click', function () {
        // console.log(1)
        print()
    })

    function print() {
        var headstr = "<html><head><title></title></head><body><h1 style='text-align:center'>用车详情</h1>";
        var footstr = "</body>";
        var printData = document.getElementById("dvData").innerHTML;
        var oldstr = document.body.innerHTML;
        document.body.innerHTML = headstr + printData + footstr;
        console.log(document.body.innerHTML)
        window.print();
        document.body.innerHTML = oldstr;
        console.log()

        $('#goback').on('click', function () {
            history.back();
        })
        $('#print').on('click', function () {
            // console.log(1)
            print()
        })
    }
    function sendmessage(id, userid, name, ti, alt) {
        var titles = ti || '用车申请'
        var str = 'http://jct.chease.cn' + '/my_list?applyid=' + id;
        if (alt) {
            str += '&my=true'
        }
        var _desc = name + '的用车'
        var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
        $.ajax({
            url: 'http://h5.bibibaba.cn/send_qywx.php',
            data: _op_data,
            dataType: 'jsonp',
            crossDomain: true,
            success: function (re) {
                if (alt) {
                    weui.alert(alt, function () {
                        history.go(0);
                    })
                } else {
                    history.go(0);
                }
            },
            error: function (err) {
                // console.log(err)
                if (alt) {
                    weui.alert(alt, function () {
                        history.go(0);
                    })
                } else {
                    history.go(0);
                }
            }
        })
    }
})