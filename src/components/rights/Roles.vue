<template>
    <div>
         <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">权限</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button type="primary" class="btn">添加角色</el-button>
    <el-table :data='rolesList' border stripe>
    <el-table-column type="expand">
        <template slot-scope="scope">
         <el-row v-for="item1 in scope.row.children" :key="item1.id" class="leave_one">
             <el-col :span="5">
                 <el-tag>{{item1.authName}}</el-tag>
                 <i class="el-icon-caret-right"></i>
             </el-col>
             <el-col :span="19">
                 <el-row v-for="item2 in item1.children" :key="item2.id">
                      <el-col :span="5">
                 <el-tag type="success">{{item2.authName}}</el-tag>
                 <i class="el-icon-caret-right"></i>
             </el-col>
             <el-col :span="19">
                  <el-tag closable type="danger" v-for="item3 in item2.children" :key="item3.id" @close='removeRightsById(scope.row.id,item3.id)'>{{item3.authName}}</el-tag>
             </el-col>
                 </el-row>
             </el-col>
             
         </el-row>
          <el-row>
             <el-col :span="5"></el-col>
             <el-col :span="19"></el-col>
             
         </el-row>
        </template>
    </el-table-column>
    <el-table-column type="index"></el-table-column>
    <el-table-column prop="rolesName" label="角色名称"></el-table-column>
    <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
    <el-table-column label="操作">
        <template slot-scope="scope">
        <el-button size="mini" type="primary" icon="el-ico-edit">编辑</el-button>
        <el-button size="mini" type="danger" icon="el-ico-delete">删除</el-button>
        <el-button size="mini" type="warning" icon="el-ico-settings" @click="showSet(scope.row)">分配权限</el-button>
        </template>
    </el-table-column>
    </el-table>
    <!-- 显示分配权限对话框 -->
    <el-dialog
  title="分配权限"
  :visible.sync="rightDialogVisible"
  width="50%"
>
<!-- node-key 每个树节点用来作为唯一标识的属性 -->
<el-tree :data="rightList" :props="defaultProps" show-checkbox
default-expand-all node-key="id" :default-checked-keys="defkeys" ref="mytree"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="fpqx">确 定</el-button>
  </span>
</el-dialog>
    </div>
</template>
<script>
export default {
    created(){this.getRolesList()},
    data () {
        return {
            rolesList:[],
            rightDialogVisible:false, //分配权限对话框默认是隐藏的
            rightList:[],
               defaultProps: {
          children: 'children',
          label: 'authName'   //defaultProps数据来源的设置
        },
        defkeys:[],
        roleId:'', //角色id
        };
    },
    methods:{
    async getRolesList(){
        const {data:res}=await this.$http.get('roles');
 if (res.meta.status != 200)
        return this.$message.error("获取角色列表失败");
        this.rolesList=res.data
    },
    removeRightsById(roleId,rightId){
         this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
         const {data:res}=await this.$http.delete(`roles/${roleId}/rights/${rightId}`)
         if(res.meta.status!=200)return this.$message.error('删除权限失败')
         this.getRolesList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    async showSet(role){
        this.roleId=role.id
        var keys=[] //用来收集最后一级的id
        //三级权限
        
     /*    role.children.forEach(item1 => {
            //一级权限
            if(item1.children) { // 避免报错
            item1.children.forEach(item2=>{
                //二级权限
                item2.children.forEach(item3=>{
                    //三级权限
                    keys.push(item3.id)
                })
            })

            }
        }); */
        function getId(obj){
            obj.children.forEach(item => {
                //递归函数自己调用自己
                if(item.children){
                   
                    
                    getId(item)
                }else {
                    keys.push(item.id)
                }
            });
        }
        getId(role)
            this.defkeys=keys
        const{data:res}=await this.$http.get(`rights/tree`)
        if(res.meta.status!=200)return this.$message.error('请求权限数据失败')
        this.rightList=res.data

        this.rightDialogVisible=true  //分配权限对话框默认是隐藏的
    },
    async fpqx(){
        
       /*  // 全选中的节点
        console.log(this.$refs.mytree.getCheckedKeys());
        //半选中的节点
        console.log(this.$refs.mytree.getHalfCheckedKeys());
        console.log(this.$refs); */
        var keys=[...this.$refs.mytree.getCheckedKeys(),...this.$refs.mytree.getHalfCheckedKeys()]
        
        
        var keysStr=keys.join(',')
        const{data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:keysStr})
          if(res.meta.status!=200)return this.$message.error('分配权限失败')
        this.getRolesList();
         this.rightDialogVisible=false
     
       
        
        
    }
    }
}
</script>
<style scoped lang="less">
    .btn{
       margin: 15px
    }
    .el-tag{
        margin: 15px
    }
    .leave_one{
        border-bottom: 1px solid #ccc;
    }
</style>