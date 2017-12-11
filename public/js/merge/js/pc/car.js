// "use strict";
$(document).ready(function () {
    var _g = W.getSearch();
    var userid = $.cookie('username');
    var pageSize = 20, pagenum = 1;
    var type = 1; //1已提交/2已审核/3未审核

    function autoget(user){
        pagenum = 1;
        if(type == 1){
            getapply(user)
        }else if(type == 2){
            get_audited(user)
        }else if(type == 3){
            get_auditing(user)
        }else if(type == 4){
            getdriver();
        }else if(type == 5){
            get_backed()
        }
    }


    $('#Toggle_apply').on('click', function () {
        $('#pc_apply').toggle('normal', function () {
            toggle_Apply()
        })
    })
    function toggle_Apply() {
        var _child = $('#pc_apply')[0].children;
        if (_child.length == 0) {
            $('#pc_apply').append(`<div style="height:9%;background:#fafafa">
                <span style="display:inline-block;height:100%;width:20%;position: relative;" id="back_apply">
                    <i class="iconfont icon-fanhui apply_back"></i>
                </span>
            </div>
            <iframe frameborder=0 width="100%" height="91%" marginheight=0 marginwidth=0 scrolling=no src="/usecar_apply"></iframe>`)
            $('#back_apply').on('click', function () {
                $('#pc_apply').toggle('normal', function () {
                    // console.log($('#pc_apply'), 'dd')
                    toggle_Apply()
                })
            })
        } else {
            $('#pc_apply').empty()
        }
    }

    function getUser() {
        W.ajax('/get_user', {
            data: { userid: userid },
            success: function (res) {
                console.log(res, 'rs')
                window._user = res;
                if (_user.user.role == '管理员') {
                    $('#hc').show();
                    $('#cdhc').show();
                    $('#cdpc').show();
                }
                localStorage.setItem('user', JSON.stringify(_user))
                autoget(_user)
            }
        })
    }
    getUser();


    function getapply(data) {
        console.log(data)
        W.ajax('/pc/_getapply', {
            data: { uid: data.user.id, type: 1, pageSize: pageSize, page: pagenum - 1 },
            success: function (res) {
                // if (res.data.length) {
                //     apply_table(res.data);
                //     getPage(res)
                // } else {
                //     $('#table_info').empty();
                //     $('#page').text('无数据')
                // }
                if (res.data.length) {
                    apply_table(res.data);
                    getPage(res)
                } else {
                    $('#table_info').empty();
                    $('#table_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                    $('#page').text('')
                }
            }
        })
    }


    function get_audited(data) {
        W.ajax('/pc/_getaudit', {
            data: { uid: data.user.id, type: 1, pageSize: pageSize, page: pagenum - 1 },
            success: function (res) {
                console.log(res, '1')
                if (res.data.length) {
                    apply_table(res.data);
                    getPage(res)
                } else {
                    $('#table_info').empty();
                    $('#table_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                    $('#page').text('')
                }
            }
        })
    }

    function get_auditing(data) {
        W.ajax('/pc/_getauditing', {
            data: { uid: data.user.id, type: 1, pageSize: pageSize, page: pagenum - 1 },
            success: function (res) {
                console.log(res, '1')
                if (res.data.length) {
                    apply_table(res.data);
                    getPage(res)
                } else {
                    $('#table_info').empty();
                    $('#table_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                    $('#page').text('')
                }

            }
        })
    }

    // function back_car() {
    //     getJson('/getcar_num', showcarlist, { depart: 58 })
    // }

    // function getdriver() {
    //     getJson('/getdriver', showcarlist1)
    // }


    function getdriver() {
        W.ajax('/getdriver', {
            data: {},
            success: function (res) {
                console.log(res, 'f')
                apply_table(res)
            }
        })
    }

    function get_backed() {
        W.ajax('/getcar_num', {
            data: { depart: 58 },
            success: function (res) {
                console.log(res);
                apply_table(res)
            }
        })
    }

    $('#ytj').on('click', function () {
        // $('.dropdown-toggle1').empty();
        // $('.dropdown-toggle1').append(`已提交
        // <strong class="caret"></strong>`);
        pagenum = 1;
        type = 1;
        getapply(_user)
    })



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

    // $("#page").paging({
    //     pageNo: 1,
    //     totalPage: 10,
    //     totalSize: 10,
    //     callback: function (num) {
    //     }
    // })
    //显示列表
    function apply_table(data) {
        $('#table_info').empty();
        data.forEach((ele, index) => {
            if (ele.name) {
                var _href = './usecar_detail?applyid=' + ele.id;
                // var _href/
                if (type == 1) {
                    _href += '&my=' + true;
                } else if (type == 2) {
                    _href += '&audited=' + true;
                } else if (type == 3) {
                    _href += '&auditing=' + true
                } else if (type == 4) { //派车
                    _href += '&give_car=' + true
                } else if (type == 5) {
                    _href += '&backing_car=' + true
                }
                var _status = 0;
                var name = ele.name
                console.log(index)
                if (ele.spstatus.length == 1) {
                    if (ele.spstatus[0].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }
                    if (ele.spstatus[0].isagree == 2) {
                        _status = 3;
                    }
                    if (!ele.spstatus[0].isagree && ele.etm > 0) {
                        _status = 4;
                    }
                } else if (ele.spstatus.length == 3) {
                    if (ele.spstatus[0].isagree == 1 && ele.spstatus[1].isagree == 1 && ele.spstatus[2].isagree == 1) {
                        _status = 1;
                        if (ele.etm) {
                            _status = 2;
                        }
                    } else {
                        _status = 0;
                    }

                    if (ele.spstatus[0].isagree == 2 || ele.spstatus[1].isagree == 2 || ele.spstatus[2].isagree == 2) {
                        _status = 3;
                    }
                    if ((!ele.spstatus[0].isagree || !ele.spstatus[1].isagree || !ele.spstatus[2].isagree) && ele.etm > 0) {
                        _status = 4;
                    }
                }
                var use_status = '';
                // var color_status = '';
                _status == 1 ? use_status = '已通过' : _status == 2 ? use_status = '已还车' : _status == 3 ? use_status = '驳回' : _status == 4 ? use_status = '已撤销' : use_status = '审核中';
                // _status == 1 ? color_status = '' : _status == 2 ? color_status = '' : _status == 3 ? color_status = 'no_agree' : _status == 4 ? color_status = 'back' : color_status = 'auditing';
                var date = W.dateToString(new Date(parseInt(ele.cre_tm) * 1000))

                var tr_content = `<tr class="">
                <td> ${index}</td>
                <td> ${ele.days}</td>
                <td>${ele.name}</td>
                <td>${ele.peer}</td>
                <td>${ele.province} </td>
                <td>${ele.address}</td>
                <td>${ele.night ? '是' : '否'}</td>
                <td>${ele.car_num}</td>
                <td>${ele.driver}</td>
                <td>${use_status}</td>
                <td><a href=${_href}>详情</a></td>
            </tr>`
                $('#table_info').append(tr_content)
            }
        })
    }


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
    //车队派车
    $('#cdpc').on('click', function () {
        // $('.dropdown-toggle2').empty();
        // $('.dropdown-toggle2').append(`车队派车
        // <strong class="caret"></strong>`);
        pagenum = 1;
        type = 4;
        getdriver();
    })
    //车队还车
    $('#cdhc').on('click', function () {
        // $('.dropdown-toggle2').empty();
        // $('.dropdown-toggle2').append(`车队还车
        // <strong class="caret"></strong>`);
        pagenum = 1;
        type = 5;
        get_backed()
    })

    $('#usesearch').on('click', function () {
        console.log(type)
        var value = $('#searchValue').val();
        if (type == 0) {
            weui.alert('请选择用车类型');
            return false;
        }
        W.ajax('/pc/pcusesearch', {
            data: { search: value, type: type, uid: _user.user.id, depart: _user.depart.id },
            success: function (res) {
                // if (res.data.length) {
                //     apply_table(res.data);
                //     $('#page').text('')
                // } else {
                //     $('#table_info').empty();
                //     $('#page').text('无数据')
                // }
                if (res.data.length) {
                    apply_table(res.data);
                    // getPage(res)
                    $('#page').text('')
                } else {
                    $('#table_info').empty();
                    $('#table_info').append(` <tr ><td colspan="11" style="text-align:center">没有数据！</td></tr>`)
                    $('#page').text('')
                }
            }
        })
    })
    // $('.dropdown').on('change',function(){
    //     console.log(1)
    // })
    // function dropdown(){

    // }
    // function getapply(){
    //     W.ajax('/getapply',{
    //         data: {}
    //     })
    // }
    // W.ajax('pc/getapply',{
    //     data:{uid:}
    // })
    // console.log(_user)
})