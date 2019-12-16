<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 栅格 24 bootstrap -->
      <!-- :gutter 栅格之间的空隙 俗称水槽 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear='getUserList'>
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="14">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username" width="80px"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          //作用域插槽
          <template slot-scope="scope">
            <!-- scope.row 当前表格一行所有的数据 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260px">
          <!--  scope有波浪号是因为scope没有用 -->
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteByUserId(scope.row.id)"></el-button>
            <!-- tooltip文字提示  :enterable="false" 鼠标不进入到 tooltip 中-->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini" @click='setRole(scope.row)'></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- size-change 设置每一页的页数  -->
      <el-pagination
       
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1,2,3,4]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户 -->
    <el-dialog
  title="添加用户"
  :visible.sync="addDialogVisible"
  width="50%"
  @close='addFormClosed'

 >
 
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
  <el-form-item label="用户名" prop="username">
    <el-input v-model="addForm.username"></el-input>
  </el-form-item>
   <el-form-item label="密码" prop="password" >
    <el-input v-model="addForm.password" type="password"></el-input>
  </el-form-item>
   <el-form-item label="邮箱" prop="email">
    <el-input v-model="addForm.email"></el-input>
  </el-form-item>
   <el-form-item label="手机" prop="mobile">
    <el-input v-model="addForm.mobile"></el-input>
  </el-form-item>
    </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
</el-dialog>
<!-- 修改用户 -->
  <el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%"
   @close='editFormClosed'>
 <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
  <el-form-item label="用户名" prop="username">
    <el-input v-model="editForm.username" disabled></el-input>
  </el-form-item>
   <el-form-item label="邮箱" prop="email">
    <el-input v-model="editForm.email"></el-input>
  </el-form-item>
   <el-form-item label="手机" prop="mobile">
    <el-input v-model="editForm.mobile"></el-input>
  </el-form-item>
    </el-form>
 

  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
</el-dialog>
<!-- 分配角色的对话框 -->
<el-dialog title="提示" :visible.sync="roleDialogVisible" width="50%">
  
  <p>用户名:{{userInfo.username}}</p>
  <p>当前的角色:{{userInfo.role_name}}</p>
  <p>
    切换新角色
     <el-select v-model="selectedRoleId" placeholder="请选择">
    <el-option
      v-for="item in rolesList"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select>
  </p>
   <span slot="footer" class="dialog-footer">
    <el-button @click="roleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRole">确 定</el-button>
  </span>
</el-dialog>

  </div>
</template>
<script>
export default {
  created() {
    this.getUserList();
  },
  data() {
    //校验邮箱的规则
    var checkEmail=(rule,value,callback)=>{
      var regEmail=/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
      if(!regEmail.test(value)) {
        return callback(new Error('邮箱不合法'))
      }
      callback()
    }
     var checkMobile=(rule,value,callback)=>{
      var regMobile=/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if(!regMobile.test(value)) {
        return callback(new Error('手机不合法'))
      }
      callback()
    }
    return {
      queryinfo: {
        query: "", //查询关键字
        pagenum: 1, //当前第几页
        pagesize: 2 //每页显示的条数
      },
      userlist: [], //用户数据
      total: 0 ,//总条数
      addDialogVisible:false,
      editDialogVisible:false,
     editForm:{},
         //修改用户检验规则
    editFormRules:{
      username:[
         { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
      ],
        email:[
         { required: true, message: '请输入用户名', trigger: 'blur' },
         {validator:checkEmail,trigger:'blur'}
           
      ],
        mobile:[
         { required: true, message: '请输入用户名', trigger: 'blur' },
         {validator:checkMobile,trigger:'blur'}
           
      ]
     
    
     },
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
       //添加用户检验规则
    addFormRules:{
      username:[
         { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
      ],
       password:[
         { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
      ],
        email:[
         { required: true, message: '请输入用户名', trigger: 'blur' },
         {validator:checkEmail,trigger:'blur'}
           
      ],
        mobile:[
         { required: true, message: '请输入用户名', trigger: 'blur' },
         {validator:checkMobile,trigger:'blur'}
           
      ]
     
    },
    roleDialogVisible:false,
    userInfo:{},//用户的信息
    rolesList:[], //所有角色的信息
     selectedRoleId:'',//选中的角色的id值
    }
   
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryinfo
      });
      if (res.meta.status != 200)
        return this.$message.error("请求数据列表失败");
      console.log(res.data);
      this.total = res.data.total;
      this.userlist = res.data.users;
      console.log(this.userlist);
    },
    handleSizeChange(newSize) {
        console.log(newSize);
        this.queryinfo.pagesize=newSize;
        this.getUserList()
        
    },
     handleCurrentChange(newPage) {
        console.log(newPage);
        this.queryinfo.pagenum=newPage;
        this.getUserList()
        
    },
    async userStateChange(info){
      //scope.row 当前表格一行所有的数据 
        
const {data:res}=await this.$http.put(`users/${info.id}/state/${info.mg_state}`);
 if (res.meta.status != 200)
        return this.$message.error("修改失败");
      console.log(res);

    },
    addFormClosed(){
      this.$refs.addFormRef.resetFields()
    },
    addUser(){
      //表单预验证
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid)return console.log('表单校验失败')
        console.log('表单校验成功');
        const {data:res}=await this.$http.post('users',this.addForm)
         if(res.meta.status!=201) return this.$message.error('添加失败')
         this.getUserList()
         this.addDialogVisible=false
      })
    
    },
    editUserInfo(){


this.$refs.editFormRef.validate(async valid=>{
  if(!valid)return console.log('表单校验失败')
  console.log(valid);
  
  console.log('表单校验成功');
  const{data:res}=await this.$http.put(`users/${this.editForm.id}`,{
    email:this.editForm.email,mobile:this.editForm.mobile
  })
  if(res.meta.status!=200)return this.$message.error('更新失败')
//  关闭窗口
  this.editDialogVisible=false
  // 刷新数据
   this.getUserList()

  
  
})
    },
      async showEditDialog(id){
        
        
        const{data:res}=await this.$http.get(`users/${id}`)
        if(res.meta.status!=200)return this.$message.error('获取用户信息失败')
       this.editForm=res.data

       this.editDialogVisible=true //让编辑对话框显示
     },
      editFormClosed(){
      this.$refs.editFormRef.resetFields()
    },
    deleteByUserId(id){
         this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
           const{data:res}=await this.$http.delete(`users/${id}`)
        if(res.meta.status!=200)return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        this.queryinfo.pagenum=1//解决删除最后一页的bug
        // 更新用户列表
        this.getUserList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
     async setRole(userInfo){
      
       
      this.userInfo=userInfo
    console.log(this.userInfo);
    this.roleDialogVisible=true
       const{data:res}=await this.$http.get('roles')
        if(res.meta.status!=200)return this.$message.error('获取角色列表用户失败')
        this.rolesList=res.data
    
    
  },
  async saveRole(){
    //如果用户没有选择角色
    if(this.selectedRoleId==''){
      return this.$message.error('请选择角色')
    }
    const{data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
    if(res.meta.status!=200)return this.$message.error('修改角色失败')
        this.getUserList()
        this.roleDialogVisible=false
        this.selectedRoleId='' //重置选择器
        this.userInfo={}
  }
  }

};
</script>
<style scoped lang="less">
</style>