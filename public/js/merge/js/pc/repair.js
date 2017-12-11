$(document).ready(function () {
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

    function autoget(user){
        pagenum = 1;
        if(type == 1){
            getapply(user)
        }else if(type == 2){
            get_audited(user)
        }else if(type == 3){
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
})