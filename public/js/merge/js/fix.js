$(document).ready(function () {

    var _g = W.getSearch();
    var _user = JSON.parse(localStorage.getItem('user'));
    window._user = _user;
    // var _user = JSON.parse(localStorage.getItem('user'));
    var _val = $('input[name="order"]:checked').val();
    var _apply2 = {
        option: {},
        spstatus: []
    };
    sessionStorage.setItem('clmx', JSON.stringify({}))
    var clmc_arr = [];
    var clmx_option = {};
    getAudit(_val)

    Array.prototype.uniques = function () {
        var res = [];
        var json = {};
        for (var i = 0; i < this.length; i++) {
            if (!json[this[i].XMMC]) {
                res.push(this[i].XMMC);
                json[this[i].XMMC] = 1;
            }
        }
        return res;
    }

    W.ajax('/fix_apply/code_king', {
        success: function (res) {
            console.log(res)
        }
    })
    W.ajax('/fix_apply/get_repairinfo', {
        success: function (res) {
            // console.log(res)
            // console.log(res.uniques())
            clmc_arr = res.uniques(); //获取唯一的维修项目名称

        }
    })
    // console.log(_user)






    $('#audit_user').on('click', function () {
        $('#container').hide();
        $('#audit_list').show();
        var state = { 'page_id': 1, 'user_id': 5 };
        var title = '选择审核人';
        var url = 'fix_apply#auditer';
        history.pushState(state, title, url);
        window.addEventListener('popstate', function (e) {
            // console.log(e);
            $('#container').show();
            $('#audit_list').hide();
        });
    })

    $('#add_repairInfo').on('click', function () {
        $('#container').hide();
        $('#repair_info').show();
        $('#clmx_delete').hide();
        var state = { 'page_id': 1, 'user_id': 5 };
        var title = '添加明细';
        var url = 'fix_apply#add_repair';
        history.pushState(state, title, url);
        window.addEventListener('popstate', function (e) {
            // console.log(e);
            $('#container').show();
            $('#repair_info').hide();
        });

    })



    //获取号牌号码
    W.ajax('/fix_apply/hphm', {
        data: { depart: _user.depart.id },
        success: function (res) {
            // console.log(res)
            console.log(res)
            var op_arr = [];
            res.forEach((ele, index) => {
                var wx_op = {
                    label: ele.name,
                    value: index
                };
                op_arr.push(wx_op)

            });
            $('#hphm').on('click', function () {
                weui.picker(op_arr, {
                    onChange: function (result) {
                        // console.log(result);
                    },
                    onConfirm: function (result) {
                        console.log(res[result[0].value], 'd');
                        var _this_car = res[result[0].value];
                        _apply2.option.HPZL = _this_car.plate_type;
                        var _hpzl = _this_car.plate_type == '02' ? '小型汽车' : '大型汽车'
                        var _clxh = _this_car.model;
                        var _date = W.date(_this_car.registe_date)
                        var _time = _date.getTime();
                        var _nowTime = Date.parse(new Date());
                        var all_Month = parseInt((_nowTime - _time) / (1000 * 60 * 60 * 24 * 30));
                        var _year = _date.getFullYear()
                        var _month = _date.getMonth() + 1;
                        var _dates = _date.getDate();
                        var _gmrq = _year + '-' + _month + '-' + _dates;
                        var _synx = '已使用' + ~~(all_Month / 12) + '年'
                        // console.log()
                        $('#hmzl').text(_hpzl);
                        $('#cpxh').text(_clxh);
                        $('#gmrq').text(_gmrq);
                        $('#synx').text(_synx);
                        $('#show_carnumber').show();
                        var text = result[0].label;

                        _apply2.option.HPHM = text;
                        $('#hphm .weui-cell__ft').text(text);
                        $('#hphm .weui-cell__ft').css({ color: '#000' })
                    },
                    id: 'hphm'
                });
            });
        }
    })
    //获取维修单位
    W.ajax('/fix_apply/wxdw', {
        success: function (res) {
            console.log(res)
            var op_arr = [];
            res.forEach((ele, index) => {
                var wx_op = {
                    label: ele.MC,
                    value: index
                };
                op_arr.push(wx_op)

            });
            $('#wxdw').on('click', function () {
                weui.picker(op_arr, {
                    onChange: function (result) {
                        console.log(result);
                    },
                    onConfirm: function (result) {
                        var text = result[0].label;
                        _apply2.option.WXDWLXDH = res[result[0].value].DH
                        _apply2.option.WXDW = text;
                        $('#wxdw .weui-cell__ft').text(text);
                        $('#wxdh').val(res[result[0].value].DH)
                        $('#wxdw .weui-cell__ft').css({ color: '#000' })
                    },
                    id: 'wxdw'
                });
            });
        }
    });


    $('input[name="price"]').on('click', function (e) {
        // form_option.night = e.target.value;
        console.log(e.target.value)
        var value = e.target.value;
        getAudit(value)
        // console.log(form_option);
    });

    //获取审核人
    var apend_data = [];
    function getAudit(v) {
        var op = {};
        op.depart = _user.depart.id;
        if (v == 1) {
            op.jwdepart = 10;
        } else if (v == 2) {
            op.jwdepart = 10;
            op.judepart = 1;
        }
        W.ajax('/getaudit', {
            data: op,
            success: function (res) {
                showaudit(res)
            }
        })



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

        function showaudit(res) {
            console.log(res, 'res')
            var jed = $('input[name="price"]:checked').val();
            console.log(jed, 'jed')
            var auditer;
            if (jed == 0) {
                auditer = res.filter(ele => { return ele.role == '科所队领导' })
            } else if (jed == 1) {
                auditer = res.filter(ele => { return ele.role == '科所队领导' || ele.role == '警务保障室领导' })
            } else {
                auditer = res.filter(ele => { return ele.role == '科所队领导' || ele.role == '局领导' || ele.role == '警务保障室领导' })
            }
            // var auditer = res.filter(ele => { return ele.role == '科所队领导' || ele.role == '局领导' || ele.role == '警务保障室领导' })
            // console.log(auditer)
            var k_l = auditer.filter(ele => { return ele.role == '科所队领导' })
            var j_l = auditer.filter(ele => { return ele.role == '警务保障室领导' });
            var ju_l = auditer.filter(ele => { return ele.role == '局领导' });
            // if (jed == 0) {
            //     apend_data = [k_l[0], null, null];
            // } else if (jed == 1) {
            //     apend_data = [k_l[0], j_l[0], null];
            // } else {
            apend_data = [k_l[0], j_l[0], ju_l[0]];
            // }

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



        // function unique(){

        // }


        // if (_user.user) {
        //     if (_user.user.role == "科所队领导") {
        //         getJson('/getaudit', showaudit, op);
        //     } else if (_user.user.role == '局领导') {

        //     } else {
        //         if (form_option.night == 1 || is_kq) {
        //             op.jwdepart = 10;
        //             op.judepart = 1;
        //         }
        //         W.ajax('/getaudit', {
        //             data: op,
        //             success: function (res) {
        //                 console.log(res)
        //             }
        //         });
        //     }
        // }
    }

    $('#clmc').on('input', function () {
        console.log(this.value, 22);
        var show_clmc_list = [];
        var _this = this;
        show_clmc_list = clmc_arr.filter(ele => ele.includes(this.value));
        console.log(show_clmc_list);
        $('#clmc_list').empty();

        for (var i = 0; i < 5; i++) {
            if (show_clmc_list[i]) {
                var _id = `list${i}`
                var tr_content = `<div id="list${i}">${show_clmc_list[i]}</div>`;
                $('#clmc_list').append(tr_content);
                $(`#${_id}`).on('click', function () {
                    // console.log($(`#${_id}`).text())
                    var _text = $(`#${_id}`).text();
                    $('#clmc').val(_text);
                    show_clmc_list = [];
                    $('#clmc_list').hide()
                })
            }
        }
        if (this.value.length) {
            $('#clmc_list').show();
        } else {
            $('#clmc_list').hide();
        }
    })

    $('#clmx_save').on('click', function () {
        var is_details = location.hash;
        var details_index = parseInt(is_details.slice(-1));
        clmx_option.XMBH = $('#clbh').val();
        clmx_option.XMMC = $('#clmc').val();
        clmx_option.SL = $('#clsl').val();
        clmx_option.DJ = $('#cldj').val();
        clmx_option.JE = $('#clje').val();
        clmx_option.LB = $('input[name="lb"]:checked').val();
        if (!clmx_option.XMMC) {
            weui.alert('请填写材料名称')
            return false;
        }
        if (!clmx_option.SL) {
            weui.alert('请填写数量');
            return false;
        }
        if (!clmx_option.DJ) {
            weui.alert('请填写单价');
            return false;
        }
        // if(!clmx_option.JE){
        //     weui.alert('请填写金额')
        // }
        console.log(clmx_option, 'option')
        var clmx_arr = sessionStorage.getItem('clmx') ? JSON.parse(sessionStorage.getItem('clmx')) : {};
        !clmx_arr.clmx_arr ? clmx_arr.clmx_arr = [] : null;
        var _i;
        if (is_details.includes('details')) {
            _i = details_index;
        } else {
            _i = clmx_arr.clmx_arr ? clmx_arr.clmx_arr.length : 0;
        }
        clmx_arr.clmx_arr[_i] = clmx_option;
        sessionStorage.setItem('clmx', JSON.stringify(clmx_arr));
        history.back();
        show_wxmx(clmx_arr)
    })

    $('#clmx_delete').on('click', function () {
        var is_details = location.hash;
        var details_index = parseInt(is_details.slice(-1));
        var clmx_arr = sessionStorage.getItem('clmx') ? JSON.parse(sessionStorage.getItem('clmx')) : {};
        clmx_arr.clmx_arr.splice(details_index, 1);
        sessionStorage.setItem('clmx', JSON.stringify(clmx_arr));
        // console.log(location);
        // debugger;
        history.back();
        show_wxmx(clmx_arr)
    })
    $('#clmx_back').on('click',function(){
        history.back()
    })
    function show_wxmx(data) {
        var _all_je = 0;
        $('#show_clli').empty();
        data.clmx_arr.forEach((ele, index) => {
            var _lb;
            _all_je += parseFloat(ele.JE);
            ele.LB == 1 ? _lb = '工时费' : _lb = '材料费'

            var tr_content = `<div style="position:relative">
            <a class="weui-cell weui-cell_access cell" href="javascript:;" style="padding:0;line-height:3" id="xq_${index}">
                <div class="weui-cell__bd" style="flex:1">
                    <div class="placeholder t_a_c">${_lb}</div>
                </div>
                <div class="weui-cell__bd slh">
                    <div class="placeholder t_a_c slh">${ele.XMMC}</div>
                </div>
                <div class="weui-cell__bd">
                    <div class="placeholder t_a_c">${ele.JE}</div>
                </div>
                <div class="weui-cell__bd">
                </div>
            </a>
            <span class="" style="position: absolute;right: 36px;top:10px;" id="delete_${index}">
                <i class="weui-icon-cancel icon-delete" style="font-size:20px;color:red"></i>
            </span>
        </div>`


            $('#show_clli').append(tr_content);
            $('#xq_' + index).on('click', function () {
                // console.log(index)
                $('#container').hide();
                $('#repair_info').show();
                var state = { 'page_id': 1, 'user_id': 5 };
                var title = '明细详情';
                var url = 'fix_apply#details_' + index;
                history.pushState(state, title, url);
                window.addEventListener('popstate', function (e) {
                    // console.log(e);
                    $('#container').show();
                    $('#repair_info').hide();
                });
                var _thisArr = data.clmx_arr[index];
                $('#clmx_delete').show();

                // $("#lb").find("input[name='lb']").removeAttr("checked");
                console.log($("#gsf"))
                $("#gsf")[0].checked = false;
                $('#clf')[0].checked = false;
                console.log($("#lb").find("input[name='lb']"))
                // console.log($("#lb").find("input[name='lb']"))
                if (_thisArr.LB == 1) {
                    // $("#gsf").attr("checked", 'checked');
                    $("#gsf")[0].checked = true;
                } else if (_thisArr.LB == 2) {
                    $('#clf')[0].checked = true;
                    // $("#clf").attr("checked", 'checked');
                }
                console.log($('input[name="lb"]:checked').val())
                $('#clbh').val(_thisArr.XMBH);
                $('#clmc').val(_thisArr.XMMC);
                $('#clsl').val(_thisArr.SL);
                $('#cldj').val(_thisArr.DJ);
                $('#clje').val(_thisArr.JE)

            })
            $('#delete_' + index).on('click', function () {
                // console.log(index);
                data.clmx_arr.splice(index, 1);
                sessionStorage.setItem('clmx', JSON.stringify(data));
                show_wxmx(data)
            })
        });
        $('#all_je').text(_all_je)
        if (data.clmx_arr.length) {
            $('#show_clli').prepend(`<div class="weui-flex" style="background:#ececec;line-height:3">
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">类别</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">材料名称</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">金额</div>
            </div>
            <div class="weui-flex__item">
                <div class="placeholder t_a_c">操作</div>
            </div>
        </div>`);
            $('#show_clli').show();
        }


    }
    $('#clsl').on('input', function () {
        var _dj = $('#cldj').val();
        if (this.value && _dj) {
            var _je = this.value * _dj
            $('#clje').val(_je)
        } else {
            $('#clje').val('')
        }
    })
    $('#cldj').on('input', function () {
        var _sl = $('#clsl').val();
        if (this.value && _sl) {
            var _je = this.value * _sl
            $('#clje').val(_je)
        } else {
            $('#clje').val('')
        }
    })



    $('#submit').on('click', function () {
        console.log(1)
        // var _val = $('input[name="wxlx"]:checked').val();
        var repair_info = JSON.parse(sessionStorage.getItem('clmx'))
        if (repair_info.clmx_arr) {
            if (!repair_info.clmx_arr.length) {
                weui.alert('请添加维修明细');
                return false
            }
        } else {
            weui.alert('请添加维修明细');
            return false
        }
        console.log(repair_info, 'repari')
        var _checkVal = [];
        $('input[name="wxlx"]').forEach(ele => {
            ele.checked ? _checkVal.push(ele.value) : null
        })
        var yjjed_type = $('input[name="price"]:checked').val();
        var yjjed;
        // console.log(_checkVal.join(''))
        if (yjjed_type == 0) {
            yjjed = '2000以内';
            _apply2.option.SPJB = 11;
            _apply2.option.XGLC = 0;
            if (!apend_data[0]) {
                weui.alert('请选择科所队领导')
                return false;
            }
        } else if (yjjed_type == 1) {
            yjjed = '2000--3000';
            _apply2.option.SPJB = 12;
            _apply2.option.XGLC = 4;
            if (!apend_data[0] || !apend_data[1]) {
                if (!apend_data[0]) {
                    weui.alert('请选择科所队领导');
                } else {
                    weui.alert('请选择警务保障室领导');
                }
                return false;
            }
        } else if (yjjed_type == 2) {
            yjjed = '3000以上';
            _apply2.option.SPJB = 13;
            _apply2.option.XGLC = 4;
            if (!apend_data[0] || !apend_data[1] || !apend_data[2]) {
                if (!apend_data[0]) {
                    weui.alert('请选择科所队领导')
                } else if (!apend_data[1]) {
                    weui.alert('请选择警务保障室领导')
                } else {
                    weui.alert('请选择局领导')
                }
                return false;
            }
        }

        var _spjb;

        console.log(apend_data)
        // if()
        _apply2.option.WXLX = _checkVal.join('');
        _apply2.option.SQR = $('#applyer').val()
        _apply2.option.SQSJ = W.dateToString(new Date());
        _apply2.option.YJJED = yjjed;
        _apply2.option.WXDWLXDH = $('#wxdh').val();
        _apply2.option.ZJE = $('#all_je').text();
        _apply2.option.DEPT = _user.depart.id;
        _apply2.option.STATE = 1;
        _apply2.option.DQLC = 2;
        _apply2.spstatus = apend_data;
        _apply2.repair_info = repair_info;
        if (!_apply2.option.SQR) {
            weui.alert('请输入申请人');
            return false;
        }
        if (!_apply2.option.HPHM) {
            weui.alert('请选择号码号牌');
            return false;
        }
        if (!_apply2.option.WXDW) {
            weui.alert('请选择维修单位');
            return false;
        }
        if (!_apply2.option.WXLX) {
            weui.alert('请选择维修类型')
        }
        getJson('/fix_apply/add_apply2', function (res) {
            console.log(res)
            sendmessage(res, _user.user.userid, _apply2.option.SQR, '车修申请', function () {
                sendmessage(res, apend_data[0].userid, _apply2.option.SQR)
            })


        }, { data: _apply2 })
        // W.ajax('/fix_apply/add_apply2', {
        //     data: _apply2,
        //     success: function (res) {
        //         console.log(res)
        //     }

        // })
        // console.log($('#applyer').val())
        // console.log(_val, 'd')
        // console.log(_apply2)
    })


    $('body').bind('click', function (event) {
        // IE支持 event.srcElement ， FF支持 event.target    
        var evt = event.srcElement ? event.srcElement : event.target;
        if (evt.id == 'clmc_list') return; // 如果是元素本身，则返回
        else {
            $('#clmc_list').hide(); // 如不是则隐藏元素
        }
    });

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
    console.log(top.location==self.location,'parent')
    function sendmessage(id, userid, name, ti, callback) {
        var titles = ti || '车修申请'
        var str = 'http://jct.chease.cn' + '/fix_detail?applyid=' + id;
        if (ti) {
            str += '&my=true'
        }
        var _desc = name + '的车修'
        var _op_data = { touser: userid, title: titles, desc: _desc, url: str, remark: "查看详情" };
        $.ajax({
            url: 'http://h5.bibibaba.cn/send_qywx.php',
            data: _op_data,
            dataType: 'jsonp',
            crossDomain: true,
            success: function (re) {
                // top.location = '/fix_detail?applyid=' + id + '&my=true'
                if (ti) {
                    callback();
                } else {
                    // if(window.parent)
                    if(top.location==self.locatio){
                        top.location = '/fix_detail?applyid=' + id + '&my=true'
                    }else {
                        window.parent.history.go(0)
                    }
                    
                }

            },
            error: function (err) {
                // top.location = '/fix_detail?applyid=' + id + '&my=true'
                if (ti) {
                    callback();
                } else {
                    if(top.location==self.locatio){
                        top.location = '/fix_detail?applyid=' + id + '&my=true'
                    }else {
                        window.parent.history.go(0)
                    }
                }
            }
        })
    }
})