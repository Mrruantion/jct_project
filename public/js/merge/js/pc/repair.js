$(document).ready(function () {
    beta()
    function beta() {
        var _g = W.getSearch();
        var _userid = $.cookie('username')
        var pageSize = 10, pagenum = 1;
        var type = 1; //1已提交2已审核3未审核4科所队审批5警务保障室审批6局领导审批7专管员审批
        var _user = {};
        var lc = {
            1: '维修申请',
            2: '科所队领导审批',
            3: '专管员审批',
            4: '警务保障室领导审批',
            6: '局领导审批',
            9: '维修信息录入',
            0: '待报销',
            'A': '已结束'
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
            3: '明细录入',
            4: '审批驳回',
            5: '待报销',
            6: '已结束'
        }
        var _HPZL = {
            '01': '大型汽车',
            '02': '小型汽车'
        }

        function autoget(user) {
            var option = {}
            if (_user.depart.name == '修理厂') {
                option = { WXDW: _user.employee.name }
            } else {
                option = { DEPT: _user.depart.objectId };
                if (_user.employee.role == 12 || _user.employee.role == 13) {
                    $('#ldshow').show();
                }
            }

            if (_user.employee.responsibility.indexOf('4') > -1) {
                $('#sgsb').show();
            }
            if (_user.employee.responsibility.indexOf('5') > -1) {
                $('#dbx').show();
                $('#Toggle_apply').hide();
            }
            if (_user.employee.isInCharge) {
                $('#Toggle_accident').show();
                $('#glyshow').show();
                $('#ldshow').show();
                $('#sgsb').show();
            }


            pagenum = 1;
            if (type == 1) {
                getapply(option)
            } else if (type == 2) {
                get_audited(user)
            } else if (type == 3) {
                get_auditing(user)
            }
        }

        function getUser() {
            wistorm_api.getUserList({ username: _userid }, '', '-createdAt', '-createdAt', 0, 0, -1, $.cookie('auth_code'), function (json) {
                _user.user = json.data[0];
                wistorm_api._list('employee', { uid: _user.user.objectId }, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (emp) {
                    _user.employee = emp.data[0];
                    wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (dep) {
                        _user.depart = dep.data[0];
                        console.log(_user, )
                        localStorage.setItem('user', JSON.stringify(_user))
                        // console.log(_user)
                        autoget(_user);
                    })
                })
            })
        }
        getUser();

        function getapply(option) {
            $('#table_scroll').show();
            $('#table_scroll1').hide();
            W.$ajax('mysql_api/list', {
                json_p: option,
                table: 'ga_apply2',
                sorts: '-XLH',
                limit: pageSize,
                pageno: pagenum
            }, function (res) {
                console.log(res, 'res')
                var i = 0;
                res.data.forEach(ele => {
                    W.$ajax('mysql_api/list', {
                        json_p: { apply2_id: ele.XLH },
                        table: 'ga_spstatus',
                        sorts: 'status'
                    }, function (res2) {
                        ele.spstatus = res2.data;
                        i++;
                        if (i == res.data.length) {
                            res.totalPage = ~~(res.total / pageSize);
                            res.total % pageSize > 0 ? res.totalPage += 1 : null;
                            getPage(res);
                            apply_table(res.data)
                        }
                    })
                })
            })
        }

        function get_audited(data) {
            var option = { uid: _user.employee.uid, sp_status: '0|4|5|6', apply2_id: '>0' }
            audit(option)
        }

        function get_auditing(data) {
            var option = { uid: _user.employee.uid, sp_status: '1', apply2_id: '>0' }
            audit(option)
        }

        function getfist() {
            var option = { status: 1, sp_status: 1, apply2_id: '>0', isagree: 0 }
            audit(option)
        }
        function getsecond() {
            var option = { status: 2, sp_status: 1, apply2_id: '>0', isagree: 0 }
            audit(option)
        }
        function getthird() {
            var option = { status: 3, sp_status: 1, apply2_id: '>0', isagree: 0 }
            audit(option)
        }
        function getfour() {
            var option = { status: 4, sp_status: 1, apply2_id: '>0', isagree: 0 }
            audit(option)
        }

        function audit(option) {
            $('#table_scroll').show();
            $('#table_scroll1').hide();
            W.$ajax('mysql_api/list', {
                json_p: option,
                table: 'ga_spstatus',
                sorts: '-cre_tm',
                limit: pageSize,
                pageno: pagenum
            }, function (res) {
                console.log(res, 'dd')
                var i = 0
                if (res.data.length) {
                    res.data.forEach(ele => {
                        W.$ajax('mysql_api/list', {
                            json_p: { XLH: ele.apply2_id },
                            table: 'ga_apply2',
                            sorts: 'XLH'
                        }, function (res1) {
                            // console.log(res1)
                            if (res1.total) {
                                ele.apply = res1.data[0]
                                W.$ajax('mysql_api/list', {
                                    json_p: { apply2_id: ele.apply2_id },
                                    table: 'ga_spstatus'
                                }, function (res3) {
                                    res1.data[0].spstatus = res3.data;
                                    i++;
                                    ele.apply = res1.data[0]
                                    if (i == res.data.length) {
                                        res.totalPage = ~~(res.total / pageSize);
                                        res.total % pageSize > 0 ? res.totalPage += 1 : null;
                                        apply_table(res.data);
                                        getPage(res)
                                    }
                                })
                            } else {
                                i++;
                                if (i == res.data.length) {
                                    res.totalPage = ~~(res.total / pageSize);
                                    res.total % pageSize > 0 ? res.totalPage += 1 : null;
                                    apply_table(res.data);
                                    getPage(res)
                                }
                            }
                        })
                    })
                } else {
                    $('#repair_info').empty();
                    $('#repair_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                    $('#page').text('')
                }
            })
        }

        function apply_table(data) {
            console.log(data, 'table')
            $('#repair_info').empty();
            var is_resubmit = false;
            if (_user.employee.isDriver || _user.depart.name == '修理厂') {
                is_resubmit = true;
            }
            if (data.length) {
                data.forEach((ele, index) => {
                   
                    console.log(ele, disabled)
                    var _ele = ele;
                    if (type == 1 || type == 9) {

                    } else {
                        _ele = ele.apply || {}
                    }
                    var disabled = _ele.spstatus.length ? _ele.spstatus[0].isagree == 1 ? false : true : true
                    if (_ele.WXLX) {
                        var wxlx = ''
                        _ele.WXLX.split('').forEach(e => {
                            wxlx += (wx[e] + '、')
                        })
                        wxlx = wxlx.slice(0, -1)
                        var _href = "./repaircar_detail?applyid=" + _ele.XLH;
                        var _href1 = './repaircar_apply?resubmit=true&applyid=' + _ele.XLH

                        if (type == 1) {
                            _href += '&my=' + true;
                        } else if (type == 2) {
                            _href += '&audited=' + true;
                        } else if (type == 3) {
                            _href += '&auditing=' + true
                        } else if (type == 9) {
                            _href += '&reimburse=' + true
                        }
                        var xianqin = 'xianqin_' + index
                        var resubmit = 'resubmit_' + index
                        var tr_content = `<tr class="">
                            <td>${index}</td>
                            <td>${_ele.HPHM}</td>
                            <td>${_HPZL[_ele.HPZL]}</td>
                            <td>${wxlx} </td>
                            <td>${_ele.YJJED}</td>
                            <td>${_ele.SQR}</td>
                            <td>${W.dateToString(W.date(_ele.SQSJ))}</td>
                            <td>${app_state[_ele.STATE]}</td>
                            <td>${lc[_ele.DQLC]}</td>
                            <td>${lc[_ele.XGLC]}</td>
                            <td>${_ele.ZJE}</td>
                            <td> 
                                <button class="btn btn-default" id=${xianqin} type="button" style="line-height:15px;padding:4px 5px">详情</button>
                                ${is_resubmit ? `<button class="btn btn-default" id=${resubmit} ${!disabled ? 'disabled' : null} type="button" style="line-height:15px;padding:4px 5px">重新提交</button>` : `<span></span`}
                            </td>
                        </tr>`

                        $('#repair_info').append(tr_content);
                        // console.log(`#${xianqin}`)
                        $(`#${xianqin}`).on('click', function () {
                            // console.log(_href)
                            top.location = _href;
                        })
                        $(`#${resubmit}`).on('click', function () {
                            fix_apply(_href1)
                            // console.log(1)
                        })
                    }
                    // <td><a href=${_href}>详情</a></td>

                })
            }

        }
        function apply_table1(data) {
            console.log(data, 'table')

            $('#repair_info1').empty();
            if (data.length) {
                data.forEach((ele, index) => {
                    var _ele = ele;
                    var tr_content = `<tr class="">
                        <td>${index}</td>
                        <td>${_ele.HPHM}</td>
                        <td>${W.dateToString(W.date(_ele.CXS))}</td>
                        <td>${_ele.CXDD}</td>
                        <td>${_ele.ZRR}</td>
                        <td>${_ele.ZRFC}</td>
                        <td>${_ele.PCJE}</td>
                        <td>${_ele.RYPCF}</td>
                        <td>${_ele.BZ}</td>
                    </tr>`
                    $('#repair_info1').append(tr_content)
                })
            }

        }
        //分页
        function getPage(data, str) {
            var page = 'page';
            str ? page = str : page
            $("#" + page).paging({
                pageNo: pagenum,
                totalPage: data.totalPage,
                totalSize: data.total,
                callback: function (num) {
                    // alert(num)
                    pagenum = num;
                    var option = {}
                    if (type == 1) {

                        if (_user.depart.name == '修理厂') {
                            option = { WXDW: _user.employee.name }
                        } else {
                            option = { DEPT: _user.depart.objectId };
                        }
                        getapply(option)
                    } else if (type == 2) {
                        get_audited(_user)
                    } else if (type == 3) {
                        get_auditing(_user)
                    } else if (type == 4) {
                        getfist()
                    } else if (type == 5) {
                        getsecond()
                    } else if (type == 6) {
                        getthird()
                    } else if (type == 7) {
                        getfour()
                    } else if (type == 8) {
                        shigu()
                    } else if (type == 9) {
                        option = { STATE: 5 }
                        getapply(option)
                    }

                }
            })
        }

        //已提交
        $('#ytj').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`已提交
            // <strong class="caret"></strong>`);
            var option = {}
            if (_user.depart.name == '修理厂') {
                option = { WXDW: _user.employee.name }
            } else {
                option = { DEPT: _user.depart.objectId };
            }
            type = 1;
            pagenum = 1;
            getapply(option)
        })



        //已审核
        $('#ysh').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`已审核
            // <strong class="caret"></strong>`)
            pagenum = 1;
            type = 2
            get_audited(_user)
        })
        //未审核
        $('#wsh').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`未审核
            // <strong class="caret"></strong>`);
            pagenum = 1;
            type = 3;
            get_auditing(_user)
            // get_audited(_user)
        })

        $('#ksd').on('click', function () {
            pagenum = 1;
            type = 4;
            getfist()
        })
        $('#hqk').on('click', function () {
            pagenum = 1;
            type = 5;
            getsecond()
        })
        $('#jld').on('click', function () {
            pagenum = 1;
            type = 6;
            getthird()
        })
        $('#zgy').on('click', function () {
            pagenum = 1;
            type = 7;
            getfour()
        })

        $('#sgsb').on('click', function () {
            pagenum = 1;
            type = 8;
            $('#table_scroll').hide();
            $('#table_scroll1').show();
            shigu()

        })
        function shigu() {
            W.$ajax('mysql_api/list', {
                json_p: { DEPT: _user.employee.departId },
                sorts: 'XLH',
                table: 'ga_accident',
                limit: pageSize,
                pageno: pagenum
            }, function (res) {
                console.log(res)
                res.totalPage = ~~(res.total / pageSize);
                res.total % pageSize > 0 ? res.totalPage += 1 : null;
                // apply_table(res.data);
                apply_table1(res.data)
                getPage(res, 'page1')
            })
        }

        $('#bxsp').on('click', function () {
            var option = {}
            option = { STATE: 5 }
            type = 9;
            pagenum = 1;
            getapply(option)
        })

        $('#Toggle_apply').on('click', function () {
            fix_apply()
        })
        function fix_apply(data) {
            $('#pc_fix_apply').toggle('slow', function () {
                // console.log($('#pc_fix_apply'));
                toggle_Apply(data);
            })
        }

        $('#Toggle_accident').on('click', function () {
            $('#accident').toggle('slow', function () {
                // console.log($('#pc_fix_apply'));
                toggle_Apply1();
            })
        })
        function toggle_Apply1() {
            var _child = $('#accident')[0].children;
            if (_child.length == 0) {
                $('#accident').append(`<div style="height:9%;background:#fafafa">
                        <span style="display:inline-block;height:100%;width:20%;position: relative;" id="back_apply1">
                                <i class="iconfont icon-fanhui apply_back"></i>
                            </span>
                        </div>
                            <iframe frameborder=0 width="100%" height="91%" marginheight=0 marginwidth=0 scrolling=no src="/repair_accident"></iframe>`)
                $('#back_apply1').on('click', function () {
                    $('#accident').toggle('normal', function () {
                        // console.log($('#pc_apply'), 'dd')
                        toggle_Apply1()
                    })
                })
            } else {
                $('#accident').empty()
            }
        }
        function toggle_Apply(data) {
            var href = data ? data : '/repaircar_apply';
            var _child = $('#pc_fix_apply')[0].children;
            if (_child.length == 0) {
                $('#pc_fix_apply').append(`<div style="height:9%;background:#fafafa">
                <span style="display:inline-block;height:100%;width:20%;position: relative;" id="back_apply">
                    <i class="iconfont icon-fanhui apply_back"></i>
                </span>
            </div>
            <iframe frameborder=0 width="100%" height="91%" marginheight=0 marginwidth=0 scrolling=no src=${href}></iframe>`)
                $('#back_apply').on('click', function () {
                    $('#pc_fix_apply').toggle('normal', function () {
                        // console.log($('#pc_apply'), 'dd')
                        toggle_Apply()
                    })
                })
            } else {
                $('#pc_fix_apply').empty()
            }
        }

        $('#liucheng').on('click', function () {
            $('#androidDialog1').fadeIn(200);
            $('#audit_cancle').on('click', function () {
                $('#androidDialog1').fadeOut(200);
            })
            $('#audit_commit').on('click', function () {
                $('#androidDialog1').fadeOut(200);
            })
        })
    }




















    function beta1() {
        var _g = W.getSearch();
        var _userid = $.cookie('username')
        var pageSize = 10, pagenum = 1;
        var type = 1; //1已提交2已审核3未审核4科所队审批5警务保障室审批6局领导审批7专管员审批
        var _user = {};
        var lc = {
            1: '维修申请',
            2: '科所队领导审批',
            3: '专管员审批',
            4: '警务保障室领导审批',
            6: '局领导审批',
            9: '维修信息录入',
            0: '待报销',
            'A': '已结束'
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
            3: '明细录入',
            4: '审批驳回',
            5: '待报销',
            6: '已结束'
        }
        var _HPZL = {
            '01': '大型汽车',
            '02': '小型汽车'
        }

        function autoget(user) {
            var option = {}
            if (_user.depart.name == '修理厂') {
                option = { WXDW: _user.employee.name }
            } else {
                option = { DEPT: _user.depart.objectId };
                if (_user.employee.role == 12 || _user.employee.role == 13) {
                    $('#ldshow').show();
                }
            }

            if (_user.employee.responsibility.indexOf('4') > -1) {
                $('#sgsb').show();
            }
            if (_user.employee.responsibility.indexOf('5') > -1) {
                $('#dbx').show();
                $('#Toggle_apply').hide();
            }
            if (_user.employee.isInCharge) {
                $('#Toggle_accident').show();
                $('#glyshow').show();
                $('#ldshow').show();
                $('#sgsb').show();
            }


            pagenum = 1;
            if (type == 1) {
                getapply(option)
            } else if (type == 2) {
                get_audited(user)
            } else if (type == 3) {
                get_auditing(user)
            }
        }

        function getUser() {
            wistorm_api.getUserList({ username: _userid }, '', '-createdAt', '-createdAt', 0, 0, -1, $.cookie('auth_code'), function (json) {
                _user.user = json.data[0];
                wistorm_api._list('employee', { uid: _user.user.objectId }, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (emp) {
                    _user.employee = emp.data[0];
                    wistorm_api._list('department', { objectId: _user.employee.departId }, '', '', '-createdAt', 0, 0, 1, -1, $.cookie('auth_code'), true, function (dep) {
                        _user.depart = dep.data[0];
                        console.log(_user, )
                        localStorage.setItem('user', JSON.stringify(_user))
                        // console.log(_user)
                        autoget(_user);
                    })
                })
            })
        }
        getUser();

        function getapply(option) {
            $('#table_scroll').show();
            $('#table_scroll1').hide();
            W.$ajax('mysql_api/list', {
                json_p: option,
                table: 'ga_apply2',
                sorts: '-XLH',
                limit: pageSize,
                pageno: pagenum
            }, function (res) {
                console.log(res, 'res')
                var i = 0;
                res.data.forEach(ele => {
                    W.$ajax('mysql_api/list', {
                        json_p: { apply2_id: ele.XLH },
                        table: 'ga_spstatus',
                        sorts: 'status'
                    }, function (res2) {
                        ele.spstatus = res2.data;
                        i++;
                        if (i == res.data.length) {
                            res.totalPage = ~~(res.total / pageSize);
                            res.total % pageSize > 0 ? res.totalPage += 1 : null;
                            getPage(res);
                            apply_table(res.data)
                        }
                    })
                })
            })


            // console.log(data)
            // W.ajax('/pc/_getapply', {
            //     data: { depart: data.depart.objectId, type: 2, pageSize: pageSize, page: pagenum - 1 },
            //     success: function (res) {
            //         console.log(res.data)
            //         // if (res.data.length) {
            //         //     apply_table(res.data);
            //         //     getPage(res)
            //         // } else {
            //         //     $('#repair_info').empty();
            //         //     $('#repair_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
            //         //     $('#page').text('')
            //         // }
            //     }
            // })
        }

        function get_audited(data) {
            var option = { uid: _user.employee.uid, sp_status: '0|4|5|6', apply2_id: '>0' }
            audit(option)
        }

        function get_auditing(data) {
            var option = { uid: _user.employee.uid, sp_status: '1', apply2_id: '>0' }
            audit(option)
        }

        function getfist() {
            var option = { status: 1, sp_status: 1, apply2_id: '>0', isagree: 0 }
            audit(option)
        }
        function getsecond() {
            var option = { status: 2, sp_status: 1, apply2_id: '>0', isagree: 0 }
            audit(option)
        }
        function getthird() {
            var option = { status: 3, sp_status: 1, apply2_id: '>0', isagree: 0 }
            audit(option)
        }
        function getfour() {
            var option = { status: 4, sp_status: 1, apply2_id: '>0', isagree: 0 }
            audit(option)
        }

        function audit(option) {
            $('#table_scroll').show();
            $('#table_scroll1').hide();
            W.$ajax('mysql_api/list', {
                json_p: option,
                table: 'ga_spstatus',
                sorts: '-cre_tm',
                limit: pageSize,
                pageno: pagenum
            }, function (res) {
                console.log(res, 'dd')
                var i = 0
                if (res.data.length) {
                    res.data.forEach(ele => {
                        W.$ajax('mysql_api/list', {
                            json_p: { XLH: ele.apply2_id },
                            table: 'ga_apply2',
                            sorts: 'XLH'
                        }, function (res1) {
                            // console.log(res1)
                            if (res1.total) {
                                ele.apply = res1.data[0]
                                W.$ajax('mysql_api/list', {
                                    json_p: { apply2_id: ele.apply2_id },
                                    table: 'ga_spstatus'
                                }, function (res3) {
                                    res1.data[0].spstatus = res3.data;
                                    i++;
                                    ele.apply = res1.data[0]
                                    if (i == res.data.length) {
                                        res.totalPage = ~~(res.total / pageSize);
                                        res.total % pageSize > 0 ? res.totalPage += 1 : null;
                                        apply_table(res.data);
                                        getPage(res)
                                    }
                                })
                            } else {
                                i++;
                                if (i == res.data.length) {
                                    res.totalPage = ~~(res.total / pageSize);
                                    res.total % pageSize > 0 ? res.totalPage += 1 : null;
                                    apply_table(res.data);
                                    getPage(res)
                                }
                            }
                        })
                    })
                } else {
                    $('#repair_info').empty();
                    $('#repair_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                    $('#page').text('')
                }
            })
        }

        function apply_table(data) {
            console.log(data, 'table')
            $('#repair_info').empty();
            var is_resubmit = false;
            if (_user.employee.isDriver || _user.depart.name == '修理厂') {
                is_resubmit = true;
            }
            if (data.length) {
                data.forEach((ele, index) => {
                   
                    console.log(ele, disabled)
                    var _ele = ele;
                    if (type == 1 || type == 9) {

                    } else {
                        _ele = ele.apply || {}
                    }
                    var disabled = _ele.spstatus.length ? _ele.spstatus[0].isagree == 1 ? false : true : true
                    if (_ele.WXLX) {
                        var wxlx = ''
                        _ele.WXLX.split('').forEach(e => {
                            wxlx += (wx[e] + '、')
                        })
                        wxlx = wxlx.slice(0, -1)
                        var _href = "./repaircar_detail?applyid=" + _ele.XLH;
                        var _href1 = './repaircar_apply?resubmit=true&applyid=' + _ele.XLH

                        if (type == 1) {
                            _href += '&my=' + true;
                        } else if (type == 2) {
                            _href += '&audited=' + true;
                        } else if (type == 3) {
                            _href += '&auditing=' + true
                        } else if (type == 9) {
                            _href += '&reimburse=' + true
                        }
                        var xianqin = 'xianqin_' + index
                        var resubmit = 'resubmit_' + index
                        var tr_content = `<tr class="">
                            <td>${index}</td>
                            <td>${_ele.HPHM}</td>
                            <td>${_HPZL[_ele.HPZL]}</td>
                            <td>${wxlx} </td>
                            <td>${_ele.YJJED}</td>
                            <td>${_ele.SQR}</td>
                            <td>${W.dateToString(W.date(_ele.SQSJ))}</td>
                            <td>${app_state[_ele.STATE]}</td>
                            <td>${lc[_ele.DQLC]}</td>
                            <td>${lc[_ele.XGLC]}</td>
                            <td>${_ele.ZJE}</td>
                            <td> 
                                <button class="btn btn-default" id=${xianqin} type="button" style="line-height:15px;padding:4px 5px">详情</button>
                                ${is_resubmit ? `<button class="btn btn-default" id=${resubmit} ${!disabled ? 'disabled' : null} type="button" style="line-height:15px;padding:4px 5px">重新提交</button>` : `<span></span`}
                            </td>
                        </tr>`

                        $('#repair_info').append(tr_content);
                        // console.log(`#${xianqin}`)
                        $(`#${xianqin}`).on('click', function () {
                            // console.log(_href)
                            top.location = _href;
                        })
                        $(`#${resubmit}`).on('click', function () {
                            fix_apply(_href1)
                            // console.log(1)
                        })
                    }
                    // <td><a href=${_href}>详情</a></td>

                })
            }

        }
        function apply_table1(data) {
            console.log(data, 'table')

            $('#repair_info1').empty();
            if (data.length) {
                data.forEach((ele, index) => {
                    var _ele = ele;
                    var tr_content = `<tr class="">
                        <td>${index}</td>
                        <td>${_ele.HPHM}</td>
                        <td>${W.dateToString(W.date(_ele.CXS))}</td>
                        <td>${_ele.CXDD}</td>
                        <td>${_ele.ZRR}</td>
                        <td>${_ele.ZRFC}</td>
                        <td>${_ele.PCJE}</td>
                        <td>${_ele.RYPCF}</td>
                        <td>${_ele.BZ}</td>
                    </tr>`
                    $('#repair_info1').append(tr_content)
                })
            }

        }
        //分页
        function getPage(data, str) {
            var page = 'page';
            str ? page = str : page
            $("#" + page).paging({
                pageNo: pagenum,
                totalPage: data.totalPage,
                totalSize: data.total,
                callback: function (num) {
                    // alert(num)
                    pagenum = num;
                    var option = {}
                    if (type == 1) {

                        if (_user.depart.name == '修理厂') {
                            option = { WXDW: _user.employee.name }
                        } else {
                            option = { DEPT: _user.depart.objectId };
                        }
                        getapply(option)
                    } else if (type == 2) {
                        get_audited(_user)
                    } else if (type == 3) {
                        get_auditing(_user)
                    } else if (type == 4) {
                        getfist()
                    } else if (type == 5) {
                        getsecond()
                    } else if (type == 6) {
                        getthird()
                    } else if (type == 7) {
                        getfour()
                    } else if (type == 8) {
                        shigu()
                    } else if (type == 9) {
                        option = { STATE: 5 }
                        getapply(option)
                    }

                }
            })
        }

        //已提交
        $('#ytj').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`已提交
            // <strong class="caret"></strong>`);
            var option = {}
            if (_user.depart.name == '修理厂') {
                option = { WXDW: _user.employee.name }
            } else {
                option = { DEPT: _user.depart.objectId };
            }
            type = 1;
            pagenum = 1;
            getapply(option)
        })



        //已审核
        $('#ysh').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`已审核
            // <strong class="caret"></strong>`)
            pagenum = 1;
            type = 2
            get_audited(_user)
        })
        //未审核
        $('#wsh').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`未审核
            // <strong class="caret"></strong>`);
            pagenum = 1;
            type = 3;
            get_auditing(_user)
            // get_audited(_user)
        })

        $('#ksdldsp').on('click', function () {
            pagenum = 1;
            type = 4;
            getfist()
        })
        $('#jwbzsldsp').on('click', function () {
            pagenum = 1;
            type = 5;
            getsecond()
        })
        $('#jldsp').on('click', function () {
            pagenum = 1;
            type = 6;
            getthird()
        })
        $('#zgysp').on('click', function () {
            pagenum = 1;
            type = 7;
            getfour()
        })

        $('#sgsb').on('click', function () {
            pagenum = 1;
            type = 8;
            $('#table_scroll').hide();
            $('#table_scroll1').show();
            shigu()

        })
        function shigu() {
            W.$ajax('mysql_api/list', {
                json_p: { DEPT: _user.employee.departId },
                sorts: 'XLH',
                table: 'ga_accident',
                limit: pageSize,
                pageno: pagenum
            }, function (res) {
                console.log(res)
                res.totalPage = ~~(res.total / pageSize);
                res.total % pageSize > 0 ? res.totalPage += 1 : null;
                // apply_table(res.data);
                apply_table1(res.data)
                getPage(res, 'page1')
            })
        }

        $('#dbx').on('click', function () {
            var option = {}
            option = { STATE: 5 }
            type = 9;
            pagenum = 1;
            getapply(option)
        })

        $('#Toggle_apply').on('click', function () {
            fix_apply()
        })
        function fix_apply(data) {
            $('#pc_fix_apply').toggle('slow', function () {
                // console.log($('#pc_fix_apply'));
                toggle_Apply(data);
            })
        }

        $('#Toggle_accident').on('click', function () {
            $('#accident').toggle('slow', function () {
                // console.log($('#pc_fix_apply'));
                toggle_Apply1();
            })
        })
        function toggle_Apply1() {
            var _child = $('#accident')[0].children;
            if (_child.length == 0) {
                $('#accident').append(`<div style="height:9%;background:#fafafa">
                        <span style="display:inline-block;height:100%;width:20%;position: relative;" id="back_apply1">
                                <i class="iconfont icon-fanhui apply_back"></i>
                            </span>
                        </div>
                            <iframe frameborder=0 width="100%" height="91%" marginheight=0 marginwidth=0 scrolling=no src="/repair_accident"></iframe>`)
                $('#back_apply1').on('click', function () {
                    $('#accident').toggle('normal', function () {
                        // console.log($('#pc_apply'), 'dd')
                        toggle_Apply1()
                    })
                })
            } else {
                $('#accident').empty()
            }
        }
        function toggle_Apply(data) {
            var href = data ? data : '/repaircar_apply';
            var _child = $('#pc_fix_apply')[0].children;
            if (_child.length == 0) {
                $('#pc_fix_apply').append(`<div style="height:9%;background:#fafafa">
                <span style="display:inline-block;height:100%;width:20%;position: relative;" id="back_apply">
                    <i class="iconfont icon-fanhui apply_back"></i>
                </span>
            </div>
            <iframe frameborder=0 width="100%" height="91%" marginheight=0 marginwidth=0 scrolling=no src=${href}></iframe>`)
                $('#back_apply').on('click', function () {
                    $('#pc_fix_apply').toggle('normal', function () {
                        // console.log($('#pc_apply'), 'dd')
                        toggle_Apply()
                    })
                })
            } else {
                $('#pc_fix_apply').empty()
            }
        }

        $('#liucheng').on('click', function () {
            $('#androidDialog1').fadeIn(200);
            $('#audit_cancle').on('click', function () {
                $('#androidDialog1').fadeOut(200);
            })
            $('#audit_commit').on('click', function () {
                $('#androidDialog1').fadeOut(200);
            })
        })
    }







    /*****************************************华丽的分割线************************************** */
    function test() {
        var _g = W.getSearch();
        var _userid = $.cookie('username')
        var pageSize = 20, pagenum = 1;
        var type = 1;
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

        function autoget(user) {
            pagenum = 1;
            if (type == 1) {
                getapply(user)
            } else if (type == 2) {
                get_audited(user)
            } else if (type == 3) {
                get_auditing(user)
            }
        }

        function getUser() {
            W.ajax('/get_user', {
                data: { userid: _userid },
                success: function (res) {
                    console.log(res, 'rs')
                    window._user = res;
                    localStorage.setItem('user', JSON.stringify(_user));
                    autoget(_user)
                }
            })
        }
        getUser();


        function getapply(data) {
            console.log(data)
            W.ajax('/pc/_getapply', {
                data: { depart: data.depart.id, type: 2, pageSize: pageSize, page: pagenum - 1 },
                success: function (res) {
                    // console.log(res, '1')
                    // if (res.data) {
                    //     apply_table(res.data);
                    //     getPage(res)
                    // } else {
                    //     $('#repair_info').empty();
                    //     $('#page').text('无数据')
                    // }
                    if (res.data.length) {
                        apply_table(res.data);
                        getPage(res)
                    } else {
                        $('#repair_info').empty();
                        $('#repair_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                        $('#page').text('')
                    }
                }
            })
        }

        function get_audited(data) {
            W.ajax('/pc/_getaudit', {
                data: { uid: data.user.id, type: 2, pageSize: pageSize, page: pagenum - 1 },
                success: function (res) {
                    console.log(res, '1')
                    // if (res.data) {
                    //     apply_table(res.data);
                    //     getPage(res)
                    // } else {
                    //     $('#repair_info').empty();
                    //     $('#page').text('无数据')
                    // }
                    if (res.data.length) {
                        apply_table(res.data);
                        getPage(res)
                    } else {
                        $('#repair_info').empty();
                        $('#repair_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                        $('#page').text('')
                    }
                }
            })
        }

        function get_auditing(data) {
            W.ajax('/pc/_getauditing', {
                data: { uid: data.user.id, type: 2, pageSize: pageSize, page: pagenum - 1 },
                success: function (res) {
                    console.log(res, '1')
                    // if (res.data) {
                    //     apply_table(res.data);
                    //     getPage(res)
                    // } else {
                    //     $('#repair_info').empty();
                    //     $('#page').text('无数据')
                    // }
                    if (res.data.length) {
                        apply_table(res.data);
                        getPage(res)
                    } else {
                        $('#repair_info').empty();
                        $('#repair_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                        $('#page').text('')
                    }
                }
            })
        }

        function apply_table(data) {
            $('#repair_info').empty();
            if (data.length) {
                data.forEach((ele, index) => {
                    if (ele.WXLX) {
                        var wxlx = ''
                        ele.WXLX.split('').forEach(e => {
                            wxlx += (wx[e] + '、')
                        })
                        wxlx = wxlx.slice(0, -1)
                        var _href = "./repaircar_detail?applyid=" + ele.XLH;
                        if (type == 1) {
                            _href += '&my=' + true;
                        } else if (type == 2) {
                            _href += '&audited=' + true;
                        } else if (type == 3) {
                            _href += '&auditing=' + true
                        }
                        var tr_content = `<tr class="">
                    <td>${index}</td>
                    <td>${ele.HPHM}</td>
                    <td>${_HPZL[ele.HPZL]}</td>
                    <td>${wxlx} </td>
                    <td>${ele.YJJED}</td>
                    <td>${ele.SQR}</td>
                    <td>${W.dateToString(W.date(ele.SQSJ))}</td>
                    <td>${app_state[ele.STATE]}</td>
                    <td>${lc[ele.DQLC]}</td>
                    <td>${lc[ele.XGLC]}</td>
                    <td>${ele.ZJE}</td>
                    <td><a href=${_href}>详情</a></td>
                </tr>`
                        $('#repair_info').append(tr_content)
                    }

                })
            }

        }
        //分页
        function getPage(data) {

            $("#page").paging({
                pageNo: pagenum,
                totalPage: data.totalPage,
                totalSize: data.total,
                callback: function (num) {
                    // alert(num)
                    pagenum = num;
                    if (type == 1) {
                        getapply(_user)
                    } else if (type == 2) {
                        get_audited(_user)
                    } else if (type == 3) {
                        get_auditing(_user)
                    }

                }
            })
        }

        //已提交
        $('#ytj').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`已提交
            // <strong class="caret"></strong>`);
            type = 1;
            pagenum = 1;
            getapply(_user)
        })



        //已审核
        $('#ysh').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`已审核
            // <strong class="caret"></strong>`)
            pagenum = 1;
            type = 2
            get_audited(_user)
        })
        //未审核
        $('#wsh').on('click', function () {
            // $('.dropdown-toggle1').empty();
            // $('.dropdown-toggle1').append(`未审核
            // <strong class="caret"></strong>`);
            pagenum = 1;
            type = 3;
            get_auditing(_user)
            // get_audited(_user)
        })




        $('#Toggle_apply').on('click', function () {
            $('#pc_fix_apply').toggle('slow', function () {
                // console.log($('#pc_fix_apply'));
                toggle_Apply();
            })
        })

        $('#Toggle_accident').on('click', function () {
            $('#accident').toggle('slow', function () {
                // console.log($('#pc_fix_apply'));
                toggle_Apply1();
            })
        })
        function toggle_Apply1() {
            var _child = $('#accident')[0].children;
            if (_child.length == 0) {
                $('#accident').append(`<div style="height:9%;background:#fafafa">
            <span style="display:inline-block;height:100%;width:20%;position: relative;" id="back_apply">
            <i class="iconfont icon-fanhui apply_back"></i>
        </span>
            </div>
            <iframe frameborder=0 width="100%" height="91%" marginheight=0 marginwidth=0 scrolling=no src="/repair_accident"></iframe>`)
                $('#back_apply').on('click', function () {
                    $('#accident').toggle('normal', function () {
                        // console.log($('#pc_apply'), 'dd')
                        toggle_Apply()
                    })
                })
            } else {
                $('#accident').empty()
            }
        }
        function toggle_Apply() {
            var _child = $('#pc_fix_apply')[0].children;
            if (_child.length == 0) {
                $('#pc_fix_apply').append(`<div style="height:9%;background:#fafafa">
            <span style="display:inline-block;height:100%;width:20%;position: relative;" id="back_apply">
            <i class="iconfont icon-fanhui apply_back"></i>
        </span>
            </div>
            <iframe frameborder=0 width="100%" height="91%" marginheight=0 marginwidth=0 scrolling=no src="/repaircar_apply"></iframe>`)
                $('#back_apply').on('click', function () {
                    $('#pc_fix_apply').toggle('normal', function () {
                        // console.log($('#pc_apply'), 'dd')
                        toggle_Apply()
                    })
                })
            } else {
                $('#pc_fix_apply').empty()
            }
        }

        $('#search').on('click', function () {
            console.log(type)
            var value = $('#searchValue').val();
            if (type == 0) {
                weui.alert('请选择用车类型');
                return false;
            }
            W.ajax('/pc/pcsearch', {
                data: { search: value, type: type, uid: _user.user.id, depart: _user.depart.id },
                success: function (res) {
                    // apply_table(res.data);
                    // if (res.data.length) {
                    //     apply_table(res.data);
                    //     $('#page').text('')
                    // } else {
                    //     $('#repair_info').empty();
                    //     $('#page').text('')
                    // }
                    if (res.data.length) {
                        apply_table(res.data);
                        $('#page').text('')
                        // getPage(res)
                    } else {
                        $('#repair_info').empty();
                        $('#repair_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                        $('#page').text('')
                    }
                }
            })

        })
    }


})