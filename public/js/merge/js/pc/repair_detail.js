$(document).ready(function () {
    var _g = W.getSearch();
    var _user = JSON.parse(localStorage.getItem('user'));
    var lc = {
        2: '科所队领导审批',
        3: '专管员审批',
        4: '警务保障室领导审批',
        6: '局领导审批',
        0: '待报销',
        A: '已结束'
    }
    var wx = {
        A: '发动机',
        B: '地盘',
        C: '电路',
        D: '轮胎',
        E: '外壳',
        Z: '其他',
    }
    var app_state = {
        0: '撤销',
        1: '审批中',
        4: '审批驳回',
        5: '待报销',
        6: '已结束'
    }
    var _HPZL = {
        '01': '大型汽车',
        '02': '小型汽车'
    }
    var _LB = {
        1: '工时费',
        2: '材料费'
    }
    function getApply() {
        W.ajax('/fix_apply/get_apply2', {
            data: { id: _g.applyid },
            success: function (res) {
                // console.log(res,'2')
                show_apply(res)
            }
        })
    }
    getApply()
    $(".datepicker").datetimepicker({
        language: "zh-CN",
        autoclose: true,//选中之后自动隐藏日期选择框
        format: "yyyy-mm-dd",//日期格式
        minView: 2
    });
    function show_apply(data) {
        console.log(data)
        var apply = data.apply2[0];
        var sp_status = data.spstatus[0].sp_status
        var wxlx = ''
        apply.WXLX.split('').forEach(ele => {
            wxlx += (wx[ele] + '、')
        })
        wxlx = wxlx.slice(0, -1)
        $('#HPHM').text(apply.HPHM);
        $('#HPZL').text(_HPZL[apply.HPZL])
        $('#YJJED').text(apply.YJJED)
        $('#WXLX').text(wxlx)
        $('#SQR').text(apply.SQR);
        $('#DEPT').text(apply.name);
        $('#SQSJ').text(W.dateToString(W.date(apply.SQSJ)));
        $('#STATE').text(app_state[apply.STATE]);
        $('#DQLC').text(lc[apply.DQLC]);
        $('#XGLC').text(lc[apply.XGLC]);
        $('#WXDW').text(apply.WXDW);
        $('#ZJE').text(apply.ZJE);
        !apply.JCRQ && sp_status == 1 ? $('#jcrq').show() : $('#JCRQ').text(apply.JCRQ)
        !apply.CCRQ && sp_status == 1 ? $('#ccsj').show() : $('#CCRQ').text(apply.CCRQ);
        $('#WXDWLXDH').text(apply.WXDWLXDH);
        !apply.JCRQ && sp_status == 1 ? $('#zjr').show() : $('#JZR').text(apply.JZR);
        // $('#wxdwdh').text(data.WXDWLXDH);
        // $('#_spstatus').text(app_state[data.STATE])
        apply.JCRQ ? $('#tjrq').hide() : $('#tjrq').show();
        show_repairinfo(data.repair_info)
        show_audit(data.spstatus)
        show_auditer(data)
    }


    function show_repairinfo(data) {
        console.log(data)
        $('#repair_info').empty();
        data.forEach((ele, index) => {
            var tr_content = `<tr class="info">
            <th>${_LB[ele.LB]}</th>
            <th>${ele.XMBH}</th>
            <th>${ele.XMMC} </th>
            <th>${ele.SL}</th>
            <th>${ele.DJ}</th>
            <th>${ele.JE}</th>
        </tr>`;
            $('#repair_info').append(tr_content)
        })

        $('#backout').on('click', function () {
            // var etm = ~~(new Date().getTime() / 1000)
            W.ajax('/fix_apply/update_apply2', {
                data: { STATE: 0, DQLC: 'A', XGLC: 'A', id: _g.applyid, sp_status: 0 },
                success: function (res) {
                    // history.go(0);
                    sendmessage(_g.applyid, _user.user.userid, data.SQR, '撤销成功')
                }
            })
        })
    }
    //审核流程
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


    function show_auditer(datas) {
        var data = datas.spstatus;
        var _spstatus = [];


        _status = 0;
        _sp_status = datas.spstatus[0].sp_status;

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

        }

        data.forEach(ele => {
            if (ele.role == '科所队领导') {
                _spstatus[0] = ele
            } else if (ele.role == '警务保障室领导') {
                _spstatus[1] = ele
            } else if (ele.role == '局领导') {
                _spstatus[2] = ele
            } else if (ele.role == '管理员') {
                _spstatus[0] = ele
            } else if (ele.role == '专管员') {
                _spstatus[3] = ele
            }
        })
        data = _spstatus;

        var _res = datas;
        // var _href = './my_list?applyid=' + _res.apply2[0].XLH + '&my=' + true;
        var state = {
            STATE: 1,
            DQLC: 0,
            XGLC: 0,
            id: _res.apply2[0].XLH
        }
        var userid = '';
        var userid1 = '';
        var is_zgy = $('input[name="zgy1"]:checked').val();
        var username = _res.apply2[0].SQR
        console.log(is_zgy)
        if (_res.spstatus.length == 1) {
            state.sid = _res.spstatus[0].sid
            if (_user.user.role !== '科所队领导') {
                $('#other_button').hide()
            }
            if (_res.spstatus[0].isagree) {
                $('#other_button').hide()
            } else {
                $('#other_button').show()
            }
            // $('#urge').on('click', function () {
            //     sendmessage(datas.apply2[0].XLH, datas.spstatus[0].userid, username, null, '已催办')
            // })

            $('#agree').on('click', function () {
                state.STATE = 5;
                state.DQLC = 0;
                state.XGLC = 'A';
                state.isagree = 1;
                state.sp_status = 5;
                W.ajax('/fix_apply/update_apply2_spstatus', {
                    data: { data: JSON.stringify(state) },
                    success: function (res) {
                        // history.go(0)
                        sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                    }
                })
            })
            $('#reject').on('click', function () {
                state.STATE = 4;
                state.DQLC = 'A';
                state.XGLC = 'A';
                state.isagree = 2;
                state.sp_status = 4;
                W.ajax('/fix_apply/update_apply2_spstatus', {
                    data: { data: JSON.stringify(state) },
                    success: function (res) {
                        sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批驳回');
                    }
                })
            })

        } else if (_res.spstatus.length == 2) {
            if (!_res.spstatus[0].isagree) {
                _userid = _res.spstatus[0].userid;
                _userid1 = _res.spstatus[1].userid
                state.DQLC = 4;
                state.XGLC = 0;
                state.sid = _res.spstatus[0].sid
            } else if (!_res.spstatus[1].isagree) {
                state.STATE = 5
                state.DQLC = 0;
                state.XGLC = 'A';
                state.sid = _res.spstatus[1].sid;
                _userid = _res.spstatus[1].userid;
                state.sp_status = 5;
            }

            // $('#urge').on('click', function () {
            //     sendmessage(_res.apply2[0].XLH, _userid, username, null, '已催办')
            // })

            $('#agree').on('click', function () {
                var _senid = _res.apply2[0].XLH;
                state.isagree = 1;
                W.ajax('/fix_apply/update_apply2_spstatus', {
                    data: { data: JSON.stringify(state) },
                    success: function (res) {
                        if (_user.user.role == '警务保障室领导') {
                            sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                        } else {
                            sendmessage(_res.apply2[0].XLH, _userid1, username);
                        }
                    }
                })
            })
            $('#reject').on('click', function () {
                state.STATE = 4;
                state.DQLC = 'A';
                state.XGLC = 'A';
                state.isagree = 2;
                state.sp_status = 4;
                W.ajax('/fix_apply/update_apply2_spstatus', {
                    data: { data: JSON.stringify(state) },
                    success: function (res) {
                        // console.log(res)
                        // history.go(0)
                        sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批驳回');
                    }
                })
            })


            if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导') {
                if (_user.user.role == '科所队领导' && _res.spstatus[0].isagree) {
                    $('#other_button').hide();
                } else if (_user.user.role == '警务保障室领导') {
                    if (!_res.spstatus[0].isagree || _res.spstatus[1].isagree) {
                        $('#other_button').hide();
                    }
                }
            }
            if (_res.apply2[0].STATE != 1 && _g.my) {
                $('#my_button').hide();
            }
        } else if (_res.spstatus.length == 3 || _res.spstatus.length == 4) {
            if (!_res.spstatus[0].isagree) {
                if (_user.user.role != '科所队领导') {
                    // $('#other_button').hide()
                }
                _userid = _res.spstatus[0].userid;
                _userid1 = _res.spstatus[1].userid
                state.DQLC = 4;
                state.XGLC = 6;
                state.sid = _res.spstatus[0].sid
            } else if (!_res.spstatus[1].isagree) {
                // if()
                if (_user.user.role != '警务保障室领导') {
                    // $('#other_button').hide()
                }
                state.DQLC = 6;
                state.XGLC = 0;
                state.sid = _res.spstatus[1].sid;
                _userid = _res.spstatus[1].userid;
                _userid1 = _res.spstatus[2].userid
            } else if (!_res.spstatus[2].isagree) {
                if (_user.user.role != '局领导') {
                    // $('#other_button').hide()
                }
                state.STATE = 5
                state.DQLC = 0;
                state.XGLC = 'A';
                state.sid = _res.spstatus[2].sid;
                _userid = _res.spstatus[2].userid;
                state.sp_status = 5;
            }
            if (_res.spstatus.length == 4) {
                if (!_res.spstatus[3].isagree) {
                    if (_user.user.role != '专管员') {
                        // $('#other_button').hide()
                    }
                    _userid = _res.spstatus[3].userid;
                    _userid1 = _res.spstatus[2].userid
                    state.STATE = 1
                    state.DQLC = 6;
                    state.XGLC = 0;
                    state.sid = _res.spstatus[3].sid;
                }
            }
            // $('#urge').on('click', function () {
            //     sendmessage(_res.apply2[0].XLH, _userid, username, null, '已催办')
            // })

            $('#agree').on('click', function () {
                var _senid = _res.apply2[0].XLH;
                is_zgy = $('input[name="zgy1"]:checked').val()
                if (_user.user.role == '警务保障室领导' && is_zgy) {
                    state.DQLC = 3;
                    state.XGLC = 6;
                    state.spstatus = {
                        status: 4,
                        isagree: 0,
                        uid: 114,
                        cre_tm: ~~(new Date().getTime() / 1000),
                        apply2_id: _senid,
                        sp_status: 1
                    }
                    _userid1 = 'zg0038'
                } else if (_user.user.role == '警务保障室领导') {
                    state.DQLC = 6;
                    state.XGLC = 0;
                    delete state.spstatus
                }
                state.isagree = 1;
                console.log(state)
                W.ajax('/fix_apply/update_apply2_spstatus', {
                    data: { data: JSON.stringify(state) },
                    success: function (res) {
                        // history.go(0);
                        // console.log(res)
                        if (_user.user.role == '局领导') {
                            sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                        } else {
                            sendmessage(_res.apply2[0].XLH, _userid1, username);
                        }
                        sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批通过');
                    }
                })
            })
            $('#reject').on('click', function () {
                state.STATE = 4;
                state.DQLC = 'A';
                state.XGLC = 'A';
                state.isagree = 2;
                state.sp_status = 4;
                W.ajax('/fix_apply/update_apply2_spstatus', {
                    data: { data: JSON.stringify(state) },
                    success: function (res) {
                        sendmessage(_res.apply2[0].XLH, _user.user.userid, username, '审批驳回');
                    }
                })
            })

            if (_user.user.role == '科所队领导' || _user.user.role == '警务保障室领导' || _user.user.role == '局领导' || _user.user.role == "专管员") {
                if (_user.user.role == '科所队领导' && _res.spstatus[0].isagree) {
                    $('#other_button').hide();
                } else if (_user.user.role == '警务保障室领导' && _res.spstatus[1].isagree) {
                    $('#other_button').hide();
                } else if (_user.user.role == '局领导' && _res.spstatus[2].isagree) {
                    $('#other_button').hide();
                } else if (_user.user.role == '专管员') {
                    if (_res.spstatus[3]) {
                        if (_res.spstatus[3].isagree) {
                            $('#other_button').hide();
                        }
                    }
                }
                if (_user.user.role == '警务保障室领导' && !_res.spstatus[1].isagree) {
                    $('#zgy').show();
                } else {
                    $('#zgy').hide();
                }
            }
            if (_res.apply2[0].STATE != 1 && _g.my) {
                $('#my_button').hide();
            }
        }
        if (_g.my) {
            $('#other_button').hide();
        }
        // if()
        var applyState = datas.apply2[0];
        console.log(applyState)
        if (applyState.STATE == 5 && _g.my) {
            $('#my_button').hide();
            $('#print_button').show();
        } else {
            $('#print_button').hide();
        }

    }
    $('#tjrq').on('click', function () {
        var tjrq_obj = {};
        tjrq_obj.jZR = $('#zjr').val();
        tjrq_obj.JCRQ = $('#jcrq').val();
        tjrq_obj.CCRQ = $('#ccsj').val();
        tjrq_obj.id = _g.applyid;
        if (!tjrq_obj.JCRQ) {
            weui.alert('请选择进厂时间');
            return false;
        }
        if (!tjrq_obj.CCRQ) {
            weui.alert('请选择出厂时间');
            return false;
        }
        W.ajax('/fix_apply/update_apply2', {
            data: tjrq_obj,
            success: function (res) {
                // console.log(res)
                history.go(0)
            }
        })
    })


    $('#goback').on('click', function () {
        history.back();
    })
    $('#print').on('click', function () {
        // console.log(1)
        print()
    })

    function print() {
        var headstr = "<html><head><title></title></head><body><h1 style='text-align:center'>车修详情</h1>";
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
        var titles = ti || '车修申请'
        var str = 'http://jct.chease.cn' + '/fix_detail?applyid=' + id;
        if (alt) {
            str += '&my=true'
        }
        var _desc = name + '的车修'
        var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
        $.ajax({
            "url": 'http://h5.bibibaba.cn/send_qywx.php',
            "data": _op_data,
            "type": "GET",
            "contentType": "application/json",
            "dataType": 'jsonp',
            "crossDomain": true,
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