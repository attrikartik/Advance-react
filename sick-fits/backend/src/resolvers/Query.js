const { forwardTo} = require('prisma-binding')
const { hasPermission } = require('../utils')
const Query = {
    async items(parent,args,ctx,info){
      const items = await ctx.db.query.items()
      return items
    },

    item: forwardTo('db'),
    
    itemsConnection: forwardTo('db'),
    
    me(parent,args,ctx,info){
       // check if user id exits
       if(!ctx.request.userId){
         return null
       }
       return ctx.db.query.user({where:{id: ctx.request.userId}},
        info)
    },
     
    async users(paent,args,ctx,info){
        // id they are logged in
          if( !ctx.request.userId){
            throw new Error('Please Logged In !!!')
          }
        // check if user has permission to query all users
          hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

        // if they do, query all users
           return ctx.db.query.users({},info)
    },

    
  async order(parent, args, ctx, info) {
    //  Make sure they are logged in
    if (!ctx.request.userId) {
      throw new Error('You arent logged in!');
    }
    //  Query the current order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id },
      },
      info
    );
    //  Check if the have the permissions to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
    if (!ownsOrder && !hasPermissionToSeeOrder) {
      throw new Error('You cant see this order');
    }
    // Return the order
    return order;
  },
  
 async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('you must be signed in!');
    }
    return ctx.db.query.orders(
      {
        where: {
          user: { id: userId },
        },
      },
      info
    );
  },
};

module.exports = Query;
